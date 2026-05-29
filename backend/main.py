from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Set, Dict
import base64
import asyncio
import numpy as np

from ml.gaussian_process import StickerPredictor
from cv.detector import StickerDetector

app = FastAPI(title="Gaussian Sticker Predictor API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Global State
TOTAL_STICKERS = 682
STICKERS_PER_PACK = 5

collected_stickers: Set[int] = set()
total_stickers_found = 0
packs_opened = 0

# Per-pack history: one entry per opened pack, used for the distribution / correlations
pack_history: List[Dict] = []

predictor = StickerPredictor(total_stickers=TOTAL_STICKERS, stickers_per_pack=STICKERS_PER_PACK)
detector = StickerDetector()

class PackData(BaseModel):
    stickers: List[int]


def compute_correlations():
    """Statistical associations between packs opened and stickers obtained."""
    if not pack_history:
        return {
            "avg_new_per_pack": 0.0,
            "avg_repeated_per_pack": 0.0,
            "duplication_rate": 0.0,
            "corr_pack_vs_new": 0.0,
        }

    news = np.array([p["new"] for p in pack_history], dtype=float)
    repeats = np.array([p["repeated"] for p in pack_history], dtype=float)
    idx = np.arange(1, len(pack_history) + 1, dtype=float)

    duplication_rate = (
        (total_stickers_found - len(collected_stickers)) / total_stickers_found
        if total_stickers_found > 0 else 0.0
    )

    # Correlation between pack order and new stickers found: expected to be negative,
    # since each new pack is less likely to contain unseen stickers (coupon collector).
    if len(idx) > 1 and news.std() > 0:
        corr_pack_vs_new = float(np.corrcoef(idx, news)[0, 1])
    else:
        corr_pack_vs_new = 0.0

    return {
        "avg_new_per_pack": float(news.mean()),
        "avg_repeated_per_pack": float(repeats.mean()),
        "duplication_rate": float(duplication_rate),
        "corr_pack_vs_new": corr_pack_vs_new,
    }

@app.get("/stats")
async def get_stats():
    unique_count = len(collected_stickers)
    repeated_count = total_stickers_found - unique_count

    # Get GP predictions
    x_pred, y_pred, sigma = predictor.predict(max_packs=packs_opened + 200)
    prob_completion = predictor.get_completion_probability(packs_opened)

    return {
        "packs_opened": packs_opened,
        "total_stickers_found": total_stickers_found,
        "unique_stickers": unique_count,
        "repeated_stickers": repeated_count,
        "total_album_size": TOTAL_STICKERS,
        "probability_completion": prob_completion,
        "gp_curve": {
            "x": x_pred,
            "y": y_pred,
            "sigma": sigma
        },
        # Marginal Gaussian (bell curve) of the GP at the current number of packs
        "predictive_distribution": predictor.get_predictive_distribution(packs_opened),
        # Per-pack new/repeated breakdown for trend visualizations
        "pack_history": pack_history,
        # Statistical associations between packs and stickers
        "correlations": compute_correlations(),
    }

@app.post("/open_pack")
async def open_pack(data: PackData):
    global packs_opened, total_stickers_found

    packs_opened += 1
    total_stickers_found += len(data.stickers)

    new_in_pack = 0
    for sid in data.stickers:
        if sid not in collected_stickers:
            new_in_pack += 1
        collected_stickers.add(sid)

    pack_history.append({
        "pack": packs_opened,
        "new": new_in_pack,
        "repeated": len(data.stickers) - new_in_pack,
        "unique_total": len(collected_stickers),
        "found_total": total_stickers_found,
    })

    predictor.add_data(packs_opened, len(collected_stickers))

    return await get_stats()

@app.post("/reset")
async def reset():
    global collected_stickers, packs_opened, total_stickers_found, predictor, pack_history
    collected_stickers = set()
    packs_opened = 0
    total_stickers_found = 0
    pack_history = []
    predictor = StickerPredictor(total_stickers=TOTAL_STICKERS, stickers_per_pack=STICKERS_PER_PACK)
    return {"status": "reset"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive frame from client (base64 encoded JPEG)
            data = await websocket.receive_text()
            
            # Remove the "data:image/jpeg;base64," prefix if present
            if "," in data:
                data = data.split(",")[1]
                
            frame_bytes = base64.b64decode(data)
            
            # Process frame
            processed_bytes, detected_ids = detector.process_frame(frame_bytes)
            
            if processed_bytes:
                # Send back the processed frame and detected IDs
                encoded_frame = base64.b64encode(processed_bytes).decode('utf-8')
                await websocket.send_json({
                    "frame": f"data:image/jpeg;base64,{encoded_frame}",
                    "detected_ids": detected_ids
                })
            else:
                # Empty response to keep the loop going smoothly
                await asyncio.sleep(0.01)
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
