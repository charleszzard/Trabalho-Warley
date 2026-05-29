import numpy as np
from scipy.stats import norm
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
        prob = 1.0 - norm.cdf(self.total_stickers, loc=y_pred[0], scale=sigma[0])
        return max(0.0, min(1.0, float(prob)))

    def get_predictive_distribution(self, packs_opened, num_points=120):
        # The GP's marginal prediction at a single x is a Normal(mean, sigma^2).
        # Sampling that PDF gives the literal "Gaussian bell curve" for the current
        # number of opened packs. The tail mass beyond total_stickers is exactly the
        # completion probability, so the curve visually explains get_completion_probability.
        if len(self.X_train) < 2:
            return {
                "x": [], "pdf": [], "mean": 0.0, "sigma": 0.0,
                "target": self.total_stickers, "prob_completion": 0.0,
            }

        mean_arr, sigma_arr = self.gp.predict([[packs_opened]], return_std=True)
        mean = float(np.clip(mean_arr[0], 0, self.total_stickers))
        sigma = float(max(sigma_arr[0], 1e-6))

        # Zoom the x-window to the bell itself (mean +- 4 sigma) so the curve always
        # reads as a Gaussian. A floor keeps it visible when the GP is very confident
        # (tiny sigma). The target line / completion area only show once the right tail
        # reaches the album size, which happens as you approach completion.
        half_width = max(4 * sigma, 3.0)
        lo = max(0.0, mean - half_width)
        hi = min(self.total_stickers * 1.05, mean + half_width)
        xs = np.linspace(lo, hi, num_points)
        pdf = norm.pdf(xs, loc=mean, scale=sigma)

        prob = 1.0 - norm.cdf(self.total_stickers, loc=mean, scale=sigma)

        return {
            "x": xs.tolist(),
            "pdf": pdf.tolist(),
            "mean": mean,
            "sigma": sigma,
            "target": self.total_stickers,
            "prob_completion": max(0.0, min(1.0, float(prob))),
        }
