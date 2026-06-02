import cv2
import numpy as np
import random

class StickerDetector:
    def __init__(self):
        # We will keep a history of recently detected sticker positions to stabilize IDs
        self.active_stickers = {}
        
    def process_frame(self, frame_bytes):
        if not frame_bytes:
            return None, []
        # Convert bytes to numpy array
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return None, []
            
        # Resize for faster processing
        height, width = frame.shape[:2]
        max_dim = 800
        if max(height, width) > max_dim:
            scale = max_dim / max(height, width)
            frame = cv2.resize(frame, (int(width * scale), int(height * scale)))
            
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Edge detection
        edged = cv2.Canny(blurred, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detected_stickers = []
        
        for c in contours:
            # Approximate the contour
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            
            # If the contour has 4 points, we can assume it's a rectangle (sticker)
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(approx)
                aspect_ratio = w / float(h)
                
                # Check if it has a sticker-like aspect ratio (usually ~0.7 or ~1.4 depending on orientation)
                # And a minimum area to avoid small noise
                area = cv2.contourArea(c)
                if area > 5000 and (0.5 < aspect_ratio < 2.0):
                    # Mock OCR: assign a random ID between 1 and 682, but try to keep it stable
                    # based on center position
                    cx, cy = x + w//2, y + h//2
                    
                    # Find if we already have a sticker near this position
                    matched_id = None
                    for sid, (px, py) in self.active_stickers.items():
                        if abs(cx - px) < 50 and abs(cy - py) < 50:
                            matched_id = sid
                            break
                            
                    if matched_id is None:
                        matched_id = random.randint(1, 682)
                        
                    self.active_stickers[matched_id] = (cx, cy)
                    
                    detected_stickers.append({
                        "id": matched_id,
                        "box": [int(x), int(y), int(w), int(h)]
                    })
                    
                    # Draw bounding box on frame
                    cv2.drawContours(frame, [approx], -1, (0, 255, 255), 2)
                    cv2.putText(frame, f"ID: {matched_id}", (x, y - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                                
        # Clean up active stickers that were not seen
        # Keep only the ones we just saw to avoid unbounded growth
        self.active_stickers = {s['id']: (s['box'][0] + s['box'][2]//2, s['box'][1] + s['box'][3]//2) for s in detected_stickers}
        
        # Encode frame back to JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        return buffer.tobytes(), [s['id'] for s in detected_stickers]
