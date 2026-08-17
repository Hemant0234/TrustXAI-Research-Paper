from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from app.schemas.cases import SaliencyMapData

class BaseExplainer(ABC):
    """
    Abstract Base Class for all medical XAI explanation adapters.
    Ensures modularity and swappability between research methods.
    """

    def __init__(self, name: str, category: str):
        self.name = name
        self.category = category

    @abstractmethod
    def generate_explanation(
        self,
        image_array: Any,
        model: Any,
        target_class: Optional[int] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> SaliencyMapData:
        """
        Generates 2D saliency matrix and associated quality indicators.
        """
        pass
