时之洄游 · THE TIME MIGRATOR
最终高清交互版
==================================================

独立新站，不基于旧 MAOEL。
建议新仓库名：TIME-MACHINE-05
上传后：https://jerry080426.github.io/TIME-MACHINE-05/

一、这一版是最终高清版
1. 所有页面图片重新导出为高清 WebP：
   - 主视口：1600–2048px，q92
   - 三幅管线图：1800×1200，q92
   - 软性材料主图：1800×1200
   - 部件档案：1600×1200
   - 四组部件档案：2200×1650
   - 环视：最长边 2048px
2. 主视口不再使用压缩缩略图；点击放大查看高清图。
3. 已删除制作时间轴板块。
4. 管线与连接整体重做：
   - 三幅管线图组成 R-01—R-03 路线图
   - 只保留铜管、插头、编织线、软管
   - 去掉电路板等无关图片
5. 软性材料重新排版：
   - 大幅渔网主图
   - 麻绳深色切片
   - 网袋米色材质卡
6. 匿名留言改为模型五星评分：
   - 不再有过去/现在/未来
   - 1–5 星，必选
   - 自动计算平均分与人数
7. 各板块交互：
   模型：拖拽环视、滚轮缩放、右键平移、5 机位、5 分组、随机节点
   部件：高清档案、悬停高亮、点击放大、管线路线切换
   留言：五星评分、匿名留言、平均分、随机阅读、刷新

二、留言公开
默认 LOCAL PREVIEW。
公开需要 Supabase，SQL 与说明：
- supabase-setup.sql
- 留言功能配置说明.md

三、只改一张图或一段文字
- 文字：编辑 index.html；节点文案在 assets/js/main.js 的 parts；管线文案在 pipe-item 的 data-text。
- 图片：替换 assets/img/ 下同名文件，保持路径不变即可。
- 也可以把一张图或一段文字发给我。

四、上传
1. https://github.com/new → TIME-MACHINE-05 → Public
2. Add file → Upload files
3. 上传 index.html 和 assets 整个文件夹
4. Commit changes
5. Settings → Pages
6. Deploy from a branch：main / (root)
7. 等待 1–3 分钟
8. 打开 https://jerry080426.github.io/TIME-MACHINE-05/

五、本地预览
直接双击 index.html，或：
python -m http.server 8000
打开 http://localhost:8000

作者：吴天浩 / 2026227093
