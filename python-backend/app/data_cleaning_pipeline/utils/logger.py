import logging
import sys

def setup_logger(name: str = "data_pipeline", level: int = logging.INFO) -> logging.Logger:
    """
    Sets up and returns a standard configured logger for the data pipeline.
    
    Args:
        name (str): The name of the logger.
        level (int): The logging level.
        
    Returns:
        logging.Logger: The configured Logger instance.
    """
    logger = logging.getLogger(name)
    
    # Avoid duplicate handlers if setup_logger is called multiple times
    if logger.hasHandlers():
        return logger
        
    logger.setLevel(level)
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    
    # Define a professional layout for the logs
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)-8s [%(name)s:%(filename)s:%(lineno)d] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    return logger
