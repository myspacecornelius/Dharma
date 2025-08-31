"""
Adapter registry for discovering and managing checkout adapters.
"""
import inspect
import logging
import pkgutil

from services.checkout.adapters.base import BaseCheckoutAdapter

logger = logging.getLogger(__name__)

class AdapterRegistry:
    """A registry for discovering and accessing checkout adapter classes."""

    def __init__(self):
        self.adapters: dict[str, type[BaseCheckoutAdapter]] = {}

    def discover_adapters(self, package) -> None:
        """
        Discover all adapter classes within a given package.

        :param package: The package to search for adapters (e.g., services.checkout.adapters).
        """
        logger.info(f"Discovering adapters in package: {package.__name__}")
        count = 0
        for _, name, ispkg in pkgutil.iter_modules(package.__path__, package.__name__ + "."):
            if ispkg:
                continue
            module = __import__(name, fromlist=["*"])
            for item_name, item in inspect.getmembers(module, inspect.isclass):
                if issubclass(item, BaseCheckoutAdapter) and item is not BaseCheckoutAdapter:
                    if not item.RETAILER or not item.MODE:
                        logger.warning(f"Found adapter class {item.__name__} without a RETAILER or MODE. Skipping.")
                        continue
                    key = f"{item.RETAILER}_{item.MODE}"
                    if key in self.adapters:
                        logger.warning(f"Duplicate adapter key '{key}' found. Overwriting.")
                    self.adapters[key] = item
                    logger.info(f"Registered adapter '{key}' from class {item.__name__}")
                    count += 1
        logger.info(f"Discovered and registered {count} adapters.")

    def get_adapter_class(self, key: str) -> type[BaseCheckoutAdapter] | None:
        """Get an adapter class by its key."""
        return self.adapters.get(key)
