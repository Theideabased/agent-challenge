import ast
import os
import json
import glob
from datetime import datetime
from abc import ABC, abstractmethod

from app.config import config
from app.models import const


# Base class for state management
class BaseState(ABC):
    @abstractmethod
    def update_task(self, task_id: str, state: int, progress: int = 0, **kwargs):
        pass

    @abstractmethod
    def get_task(self, task_id: str):
        pass

    @abstractmethod
    def get_all_tasks(self, page: int, page_size: int):
        pass


# Memory state management
class MemoryState(BaseState):
    def __init__(self):
        self._tasks = {}
        self._restore_tasks_from_disk()
    
    def _restore_tasks_from_disk(self):
        """Restore task state from disk on startup"""
        try:
            from app.utils import utils
            tasks_dir = utils.task_dir()
            if not os.path.exists(tasks_dir):
                return
            
            # Scan all task directories
            for task_id in os.listdir(tasks_dir):
                task_path = os.path.join(tasks_dir, task_id)
                if not os.path.isdir(task_path):
                    continue
                
                # Check if task has completed files
                final_videos = glob.glob(os.path.join(task_path, "final-*.mp4"))
                combined_videos = glob.glob(os.path.join(task_path, "combined-*.mp4"))
                script_file = os.path.join(task_path, "script.json")
                audio_file = os.path.join(task_path, "audio.mp3")
                subtitle_file = os.path.join(task_path, "subtitle.srt")
                
                if final_videos:
                    # Task completed - restore its state
                    task_data = {
                        "task_id": task_id,
                        "state": const.TASK_STATE_COMPLETE,
                        "progress": 100,
                        "videos": final_videos,
                        "combined_videos": combined_videos,
                    }
                    
                    # Try to get timestamp from file modification time
                    try:
                        created_at = os.path.getmtime(final_videos[0])
                        task_data["created_at"] = datetime.fromtimestamp(created_at).isoformat()
                    except:
                        task_data["created_at"] = datetime.now().isoformat()
                    
                    # Load script if available
                    if os.path.exists(script_file):
                        try:
                            with open(script_file, 'r', encoding='utf-8') as f:
                                script_data = json.load(f)
                                task_data["script"] = script_data.get("script", "")
                                task_data["terms"] = script_data.get("terms", [])
                        except:
                            pass
                    
                    if os.path.exists(audio_file):
                        task_data["audio_file"] = audio_file
                    
                    if os.path.exists(subtitle_file):
                        task_data["subtitle_path"] = subtitle_file
                    
                    self._tasks[task_id] = task_data
        except Exception as e:
            # Don't fail startup if restoration fails
            print(f"Warning: Failed to restore tasks from disk: {e}")

    def get_all_tasks(self, page: int, page_size: int):
        start = (page - 1) * page_size
        end = start + page_size
        tasks = list(self._tasks.values())
        
        # Sort: Processing videos first, then by timestamp (newest first)
        def sort_key(task):
            # If task is processing (state != 1), put it first (use 0)
            # If task is complete (state == 1), use timestamp (invert for newest first)
            is_complete = task.get('state', 0) == const.TASK_STATE_COMPLETE
            timestamp = task.get('created_at', '1970-01-01T00:00:00')
            
            # Return tuple: (is_complete, -timestamp)
            # False sorts before True, so processing comes first
            # Negative timestamp comparison for reverse chronological order
            return (is_complete, timestamp)
        
        tasks.sort(key=sort_key, reverse=True)
        
        total = len(tasks)
        return tasks[start:end], total

    def update_task(
        self,
        task_id: str,
        state: int = const.TASK_STATE_PROCESSING,
        progress: int = 0,
        **kwargs,
    ):
        progress = int(progress)
        if progress > 100:
            progress = 100

        # Add timestamp if this is a new task
        if task_id not in self._tasks:
            kwargs["created_at"] = datetime.now().isoformat()
        
        self._tasks[task_id] = {
            "task_id": task_id,
            "state": state,
            "progress": progress,
            **kwargs,
        }

    def get_task(self, task_id: str):
        return self._tasks.get(task_id, None)

    def delete_task(self, task_id: str):
        if task_id in self._tasks:
            del self._tasks[task_id]


# Redis state management
class RedisState(BaseState):
    def __init__(self, host="localhost", port=6379, db=0, password=None):
        import redis

        self._redis = redis.StrictRedis(host=host, port=port, db=db, password=password)

    def get_all_tasks(self, page: int, page_size: int):
        start = (page - 1) * page_size
        end = start + page_size
        tasks = []
        cursor = 0
        total = 0
        while True:
            cursor, keys = self._redis.scan(cursor, count=page_size)
            total += len(keys)
            if total > start:
                for key in keys[max(0, start - total):end - total]:
                    task_data = self._redis.hgetall(key)
                    task = {
                        k.decode("utf-8"): self._convert_to_original_type(v) for k, v in task_data.items()
                    }
                    tasks.append(task)
                    if len(tasks) >= page_size:
                        break
            if cursor == 0 or len(tasks) >= page_size:
                break
        return tasks, total

    def update_task(
        self,
        task_id: str,
        state: int = const.TASK_STATE_PROCESSING,
        progress: int = 0,
        **kwargs,
    ):
        progress = int(progress)
        if progress > 100:
            progress = 100

        fields = {
            "task_id": task_id,
            "state": state,
            "progress": progress,
            **kwargs,
        }

        for field, value in fields.items():
            self._redis.hset(task_id, field, str(value))

    def get_task(self, task_id: str):
        task_data = self._redis.hgetall(task_id)
        if not task_data:
            return None

        task = {
            key.decode("utf-8"): self._convert_to_original_type(value)
            for key, value in task_data.items()
        }
        return task

    def delete_task(self, task_id: str):
        self._redis.delete(task_id)

    @staticmethod
    def _convert_to_original_type(value):
        """
        Convert the value from byte string to its original data type.
        You can extend this method to handle other data types as needed.
        """
        value_str = value.decode("utf-8")

        try:
            # try to convert byte string array to list
            return ast.literal_eval(value_str)
        except (ValueError, SyntaxError):
            pass

        if value_str.isdigit():
            return int(value_str)
        # Add more conversions here if needed
        return value_str


# Global state
_enable_redis = config.app.get("enable_redis", False)
_redis_host = config.app.get("redis_host", "localhost")
_redis_port = config.app.get("redis_port", 6379)
_redis_db = config.app.get("redis_db", 0)
_redis_password = config.app.get("redis_password", None)

state = (
    RedisState(
        host=_redis_host, port=_redis_port, db=_redis_db, password=_redis_password
    )
    if _enable_redis
    else MemoryState()
)
