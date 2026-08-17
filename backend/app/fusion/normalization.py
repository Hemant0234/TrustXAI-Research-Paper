from typing import List, Union

def normalize_saliency_matrix(
    matrix: Union[List[List[float]], any],
    clip_percentile: float = 99.5
) -> List[List[float]]:
    """
    Normalizes a 2D saliency matrix to [0, 1] range.
    Supports both numpy ndarray and native Python list-of-lists.
    """
    try:
        import numpy as np
        arr = np.array(matrix, dtype=np.float32)
        if arr.size == 0:
            return matrix
        upper_val = np.percentile(arr, clip_percentile)
        arr = np.clip(arr, 0.0, upper_val)
        min_val, max_val = float(arr.min()), float(arr.max())
        if max_val - min_val > 1e-8:
            norm_arr = (arr - min_val) / (max_val - min_val)
        else:
            norm_arr = np.zeros_like(arr)
        return [[round(float(v), 4) for v in row] for row in norm_arr]
    except ImportError:
        # Pure Python fallback
        flat = [val for row in matrix for val in row]
        if not flat:
            return matrix
        min_val, max_val = min(flat), max(flat)
        if max_val - min_val > 1e-8:
            return [[round(float((v - min_val) / (max_val - min_val)), 4) for v in row] for row in matrix]
        else:
            return [[0.0 for _ in row] for row in matrix]
