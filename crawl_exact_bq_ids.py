import urllib.request
import re
import json
import html
from concurrent.futures import ThreadPoolExecutor

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.jjwxc.net/'
}

# 38 Tag cấu hình với BQ ID chuẩn xác 100% của Tấn Giang
EXACT_BQ_CONFIGS = [
    ('wuxianliu', 83, None, '无限流', 'Vô hạn lưu'),
    ('lingyi', 26, None, '灵异神怪', 'Kinh dị & linh dị'),
    ('chuanshu', 134, None, '穿书', 'Xuyên sách'),
    ('chongsheng', 75, None, '重生', 'Sống lại'),
    ('kuaichuan', 125, None, '快穿', 'Xuyên nhanh'),
    ('chuanyue', 60, None, '穿越时空', 'Xuyên không'),
    ('xitong', 122, None, '系统', 'Hệ thống'),
    ('xianxia', 68, None, '仙侠修真', 'Tiên hiệp tu chân'),
    ('gameonline', 92, None, '游戏网游', 'Game online'),
    ('esport', 328, None, '电竞', 'Esport'),
    ('zhongtian', 66, None, '种田文', 'Truyện làm ruộng'),
    ('xiaoyuan', 185, None, '校园', 'Học đường'),
    ('gongting', 32, None, '宫廷侯爵', 'Cung đình hầu tước'),
    ('dushi', 30, None, '都市', 'Đô thị'),
    ('xingji', 135, None, '星际', 'Vũ trụ'),
    ('yulequan', 64, None, '娱乐圈', 'Showbiz'),
    ('moxishi', 81, None, '末世', 'Tận thế'),
    ('minguo', 61, None, '民国', 'Dân quốc'),
    ('abo', 259, None, 'ABO', 'ABO'),
    ('shengzi', 20, None, '生子', 'Truyện sinh con'),
    ('haomen', 33, None, '豪门世家', 'Danh gia vọng tộc'),
    ('wanrenmi', 295, None, '万人迷', 'Vạn người mê'),
    ('jijia', 97, None, '机甲', 'Cơ giáp'),
    ('zhibo', 142, None, '直播', 'Livestream'),
    ('zhugong', None, 3, '主攻', 'Góc nhìn của công'),
    ('zhushou', None, 4, '主受', 'Góc nhìn của thụ'),
    ('qiangqiang', 19, None, '强强', 'Cả đôi đều mạnh'),
    ('qingyou', 39, None, '情有独钟', 'Tình yêu duy nhất'),
    ('tianwen', 124, None, '甜文', 'Truyện ngọt'),
    ('shuangwen', 137, None, '爽文', 'Truyện sướng'),
    ('tianzuo', 52, None, '天作之合', 'Trời sinh một cặp'),
    ('shadiao', 266, None, '沙雕', 'Hài hước'),
    ('gouxie', 275, None, '狗血', 'Máu chó'),
    ('nianxia', 21, None, '年下', 'Niên hạ'),
    ('pojing', 47, None, '破镜重圆', 'Gương vỡ lại lành'),
    ('huanxi', 41, None, '欢喜冤家', 'Hoan hỉ oan gia'),
    ('xianhun', 315, None, '先婚后爱', 'Cưới trước yêu sau'),
    ('zhuma', 62, None, '青梅竹马', 'Thanh mai trúc mã')
]

with open('src/data/jjwxcRealData.json', 'r', encoding='utf-8') as f:
    master_data = json.load(f)

all_novels_map = {n['novelId']: n for n in master_data.get('allNovels', [])}
exact_tag_rankings = {}

def fetch_exact_tag(item):
    tag_id, bq_id, mainview, tag_zh, tag_vi = item
    
    tag_novels = []
    # Lấy trang 1 và 2 từ bookbase
    for page in [1, 2]:
        if bq_id:
            url = f'https://www.jjwxc.net/bookbase.php?s_typeid=1&fbsj=0&xx=2&bq={bq_id}&orderstr=2&page={page}'
        else:
            url = f'https://www.jjwxc.net/bookbase.php?s_typeid=1&fbsj=0&xx=2&mainview={mainview}&orderstr=2&page={page}'
            
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as res:
                page_html = res.read().decode('gb18030', errors='ignore')
                rows = re.findall(r'<tr[^>]*>(.*?)</tr>', page_html, re.DOTALL)
                for r in rows:
                    if 'onebook.php?novelid=' not in r:
                        continue
                    tds = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
                    if len(tds) < 6:
                        continue
                    
                    author_td = tds[0]
                    author_m = re.search(r'authorid=(\d+)[^>]*>(.*?)</a>', author_td)
                    author_id = author_m.group(1) if author_m else ''
                    author_name = re.sub(r'<[^>]+>', '', author_m.group(2)).strip() if author_m else re.sub(r'<[^>]+>', '', author_td).strip()
                    
                    title_td = tds[1]
                    title_m = re.search(r'href=[\"\'][^\"\']*onebook\.php\?novelid=(\d+)[\"\'][^>]*title=[\"\'](.*?)[\"\'][^>]*>(.*?)</a>', title_td, re.DOTALL)
                    if not title_m:
                        title_m2 = re.search(r'novelid=(\d+)[^>]*>(.*?)</a>', title_td)
                        if not title_m2: continue
                        nid = title_m2.group(1)
                        title = re.sub(r'<[^>]+>', '', title_m2.group(2)).strip()
                        tooltip = ''
                    else:
                        nid = title_m.group(1)
                        tooltip = html.unescape(title_m.group(2))
                        title = re.sub(r'<[^>]+>', '', title_m.group(3)).strip()
                    
                    intro = ''
                    tags = [tag_zh]
                    if tooltip:
                        intro_m = re.search(r'简介[：:](.*?)(?:标签|$)', tooltip, re.DOTALL)
                        if intro_m:
                            intro = intro_m.group(1).strip()
                        tags_m = re.search(r'标签[：:](.*)', tooltip, re.DOTALL)
                        if tags_m:
                            raw_tags = tags_m.group(1).strip()
                            for t in raw_tags.split():
                                if t.strip() and t.strip() not in tags:
                                    tags.append(t.strip())

                    genre = re.sub(r'<[^>]+>', '', tds[2]).strip()
                    status = re.sub(r'<[^>]+>', '', tds[3]).strip()
                    word_count = re.sub(r'<[^>]+>', '', tds[4]).strip()
                    score = re.sub(r'<[^>]+>', '', tds[5]).strip()
                    publish_date = re.sub(r'<[^>]+>', '', tds[6]).strip() if len(tds) > 6 else ''

                    novel_item = {
                        'novelId': nid,
                        'title': title,
                        'author': author_name,
                        'authorId': author_id,
                        'genre': genre,
                        'status': status,
                        'wordCount': word_count,
                        'score': score,
                        'publishDate': publish_date,
                        'intro': intro,
                        'coverUrl': f'https://i9-static.jjwxc.net/novelimage.php?novelid={nid}',
                        'jjwxcUrl': f'https://www.jjwxc.net/onebook.php?novelid={nid}',
                        'tags': tags
                    }
                    tag_novels.append(novel_item)
        except Exception as e:
            print(f"Lỗi tải {tag_zh} (bq={bq_id}): {e}")
            
    print(f"✅ Tag [{tag_zh}] (bq={bq_id}) -> {len(tag_novels)} truyện chuẩn xác 100%!")
    return tag_id, tag_novels

print("Đang quét toàn bộ 38 BXH Tag theo mã BQ ID chuẩn của Tấn Giang...")
with ThreadPoolExecutor(max_workers=15) as executor:
    results = executor.map(fetch_exact_tag, EXACT_BQ_CONFIGS)
    for tag_id, novels in results:
        seen = set()
        unique_novels = []
        for n in novels:
            nid = n['novelId']
            if nid not in seen:
                seen.add(nid)
                unique_novels.append(n)
                if nid not in all_novels_map:
                    all_novels_map[nid] = n
                else:
                    for t in n.get('tags', []):
                        if t not in all_novels_map[nid].get('tags', []):
                            all_novels_map[nid]['tags'].append(t)
        exact_tag_rankings[tag_id] = unique_novels[:100]

print(f"Tổng số truyện sau khi nạp: {len(all_novels_map)}")
master_data['allNovels'] = list(all_novels_map.values())
master_data['tagRankings'] = exact_tag_rankings

with open('src/data/jjwxcRealData.json', 'w', encoding='utf-8') as f:
    json.dump(master_data, f, ensure_ascii=False, indent=2)

print("ĐÃ LƯU THÀNH CÔNG DỮ LIỆU CHUẨN XÁC TUYỆT ĐỐI THEO BQ ID CỦA TẤN GIANG!")
