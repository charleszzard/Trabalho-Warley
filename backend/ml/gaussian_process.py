import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C, WhiteKernel

class StickerPredictor:
    def __init__(self, total_stickers=682, stickers_per_pack=5):
        self.total_stickers = total_stickers
        self.stickers_per_pack = stickers_per_pack
        
        # Kernel: RBF for smooth curve + WhiteKernel for noise (repeated stickers introduce noise)
        # We use a constant kernel to scale the RBF
        kernel = C(1.0, (1e-3, 1e3)) * RBF(100.0, (1e-2, 1e4)) + WhiteKernel(noise_level=1, noise_level_bounds=(1e-5, 1e1))
        self.gp = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=5, normalize_y=True)
        
        # Training data
        self.X_train = [] # Packs opened
        self.y_train = [] # Unique stickers collected
        
        # Start with 0 packs, 0 stickers to anchor the GP
        self.add_data(0, 0)
        
    def add_data(self, packs_opened, unique_stickers):
        self.X_train.append([packs_opened])
        self.y_train.append(unique_stickers)
        
        # Refit the model if we have more than 2 points
        if len(self.X_train) > 1:
            # We add a small artificial point far in the future using the coupon collector math 
            # to help the GP extrapolate the asymptotic behavior, else GP reverts to mean zero (or constant).
            # Coupon collector expected packs for full album ~ N/P * log(N)
            expected_total_packs = int((self.total_stickers / self.stickers_per_pack) * np.log(self.total_stickers))
            
            X_fit = np.array(self.X_train)
            y_fit = np.array(self.y_train)
            
            # Add synthetic asymptote data to guide the GP
            X_synthetic = np.array([[expected_total_packs], [expected_total_packs * 1.5]])
            y_synthetic = np.array([self.total_stickers * 0.99, self.total_stickers])
            
            X_combined = np.vstack((X_fit, X_synthetic))
            y_combined = np.concatenate((y_fit, y_synthetic))
            
            self.gp.fit(X_combined, y_combined)
            
    def predict(self, max_packs=1000):
        if len(self.X_train) < 2:
            return [], [], []
            
        # Predict from 0 up to max_packs
        X_pred = np.atleast_2d(np.linspace(0, max_packs, 100)).T
        y_pred, sigma = self.gp.predict(X_pred, return_std=True)
        
        # Cap predictions at total_stickers
        y_pred = np.clip(y_pred, 0, self.total_stickers)
        
        return X_pred.flatten().tolist(), y_pred.tolist(), sigma.tolist()
        
    def get_completion_probability(self, packs_opened):
        if len(self.X_train) < 2:
            return 0.0
            
        # We predict the number of unique stickers at the current packs opened
        y_pred, sigma = self.gp.predict([[packs_opened]], return_std=True)
        
        if sigma[0] == 0:
            return 1.0 if y_pred[0] >= self.total_stickers else 0.0
            
        # Probability that unique stickers >= total_stickers
        # P(Y >= total_stickers) = 1 - CDF(total_stickers)
        from scipy.stats import norm
        prob = 1.0 - norm.cdf(self.total_stickers, loc=y_pred[0], scale=sigma[0])
        return max(0.0, min(1.0, float(prob)))
