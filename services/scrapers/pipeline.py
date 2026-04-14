import os
import json
from datetime import datetime

class LocalFilePipeline:
    def process_item(self, item, spider):
        now = datetime.now()
        
        # Get directory name from spider, or fallback to spider.name
        source_name = getattr(spider, "source_name", spider.name)
        
        output_dir = os.path.join("bronze", source_name, now.strftime("%Y"), now.strftime("%m"), now.strftime("%d"))
        os.makedirs(output_dir, exist_ok=True)
        
        output_file = os.path.join(output_dir, "offres.json")
        
        with open(output_file, 'a', encoding='utf-8') as f:
            line = json.dumps(dict(item), ensure_ascii=False) + "\n"
            f.write(line)
            
        return item