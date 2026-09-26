import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'server_db.json');

// Cấu hình middleware để đọc json
app.use(express.json());

// Khởi tạo database server-side dạng file JSON nếu chưa tồn tại
const INITIAL_ACCOUNTS = [
  {
    email: 'askerhater21@gmail.com',
    uid: 'user_askerhater21',
    userCode: '888999',
    displayName: 'Thủ Lĩnh Chocoatl',
    userAvatar: '',
    friends: []
  }
];

interface DBStructure {
  users: Record<string, {
    userCode: string;
    uid: string;
    email: string;
    displayName: string;
    userAvatar: string;
    friends: string[];
  }>;
  conversations: Array<{
    id: string;
    type: string;
    name?: string;
    members: string[];
    messages: Array<{
      senderCode: string;
      senderName: string;
      senderAvatar?: string;
      content: string;
      time: string;
      timestamp: number;
    }>;
    createdAt: string;
  }>;
}

function loadDB(): DBStructure {
  let db: DBStructure;
  if (!fs.existsSync(DB_FILE)) {
    db = {
      users: {},
      conversations: [
        {
          id: 'global_chat',
          type: 'group',
          name: 'Sảnh Chờ Chung',
          members: [], // rỗng có nghĩa là mở cho mọi người
          messages: [
            {
              senderCode: 'SYSTEM',
              senderName: 'Hệ thống',
              content: 'Chào mừng các bạn đến với Sảnh Chờ Chung! Hãy kết bạn và lập nhóm chat riêng nhé.',
              time: '00:00',
              timestamp: Date.now()
            }
          ],
          createdAt: new Date().toISOString()
        }
      ]
    };
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } catch (e) {
      console.error("Lỗi đọc server_db.json, đang khởi tạo lại...", e);
      db = { users: {}, conversations: [] };
    }
  }

  // Tự động bảo đảm INITIAL_ACCOUNTS có trong db
  let updated = false;
  for (const acc of INITIAL_ACCOUNTS) {
    if (!db.users[acc.userCode]) {
      db.users[acc.userCode] = {
        userCode: acc.userCode,
        uid: acc.uid,
        email: acc.email,
        displayName: acc.displayName,
        userAvatar: acc.userAvatar || '',
        friends: acc.friends || []
      };
      updated = true;
    }
  }

  if (updated || !fs.existsSync(DB_FILE)) {
    saveDB(db);
  }

  return db;
}

function saveDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Lỗi lưu server_db.json:", e);
  }
}

// Helper hàm tìm kiếm người dùng linh hoạt theo userCode, UID hoặc email
function findUserInDB(query: string, dbData: DBStructure) {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  // 1. Tìm chính xác theo key userCode
  if (dbData.users[query.trim()]) {
    return dbData.users[query.trim()];
  }

  // 2. Tìm theo userCode (case-insensitive), UID hoặc Email
  const allUsers = Object.values(dbData.users);
  const found = allUsers.find(u =>
    (u.userCode && u.userCode.toLowerCase() === q) ||
    (u.uid && u.uid.toLowerCase() === q) ||
    (u.email && u.email.toLowerCase() === q)
  );

  if (found) return found;

  // 3. Tra cứu từ INITIAL_ACCOUNTS
  const initAcc = INITIAL_ACCOUNTS.find(a =>
    a.userCode.toLowerCase() === q ||
    a.uid.toLowerCase() === q ||
    a.email.toLowerCase() === q
  );

  if (initAcc) {
    dbData.users[initAcc.userCode] = {
      userCode: initAcc.userCode,
      uid: initAcc.uid,
      email: initAcc.email,
      displayName: initAcc.displayName,
      userAvatar: initAcc.userAvatar || '',
      friends: initAcc.friends || []
    };
    saveDB(dbData);
    return dbData.users[initAcc.userCode];
  }

  return null;
}

// === CÁC API ENDPOINTS ===

// 1. Đồng bộ / Đăng ký người dùng lên Server
app.post('/api/sync-profile', (req, res) => {
  const { uid, email, displayName, userAvatar, userCode } = req.body;
  if (!uid || !userCode) {
    return res.status(400).json({ error: "Thiếu UID hoặc UserCode" });
  }

  const dbData = loadDB();
  const existingUser = dbData.users[userCode];

  if (existingUser) {
    // Cập nhật thông tin
    dbData.users[userCode] = {
      ...existingUser,
      uid,
      email: email || existingUser.email,
      displayName: displayName || existingUser.displayName,
      userAvatar: userAvatar || existingUser.userAvatar
    };
  } else {
    // Tạo mới hoàn toàn
    dbData.users[userCode] = {
      userCode,
      uid,
      email: email || '',
      displayName: displayName || 'Người chơi',
      userAvatar: userAvatar || '',
      friends: []
    };
  }

  saveDB(dbData);
  res.json({ success: true, user: dbData.users[userCode] });
});

// 1b. Lấy thông tin profile bằng UID (để khôi phục profile khi chuyển thiết bị)
app.get('/api/profile', (req, res) => {
  const uid = req.query.uid as string;
  if (!uid) {
    return res.status(400).json({ error: "Thiếu UID" });
  }

  const dbData = loadDB();
  const user = findUserInDB(uid, dbData);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, error: "Không tìm thấy hồ sơ người chơi với UID này" });
  }
});

// 2. Tìm kiếm thông tin người dùng bằng UserCode / UID / Email trên Server
app.get('/api/users/:code', (req, res) => {
  const code = req.params.code.trim();
  const dbData = loadDB();
  const user = findUserInDB(code, dbData);
  if (user) {
    res.json({
      success: true,
      user: {
        userCode: user.userCode,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        userAvatar: user.userAvatar
      }
    });
  } else {
    res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
  }
});

// 3. Kết bạn (Hỗ trợ kết bạn 2 chiều trên Server)
app.post('/api/add-friend', (req, res) => {
  const { myCode, targetCode } = req.body;
  if (!myCode || !targetCode) {
    return res.status(400).json({ error: "Thiếu thông tin kết bạn" });
  }

  const dbData = loadDB();
  const me = findUserInDB(myCode, dbData);
  const target = findUserInDB(targetCode, dbData);

  if (!me) {
    return res.status(404).json({ error: "Không tìm thấy hồ sơ của bạn trên server" });
  }
  if (!target) {
    return res.status(404).json({ error: "Không tìm thấy người dùng mục tiêu trên server" });
  }

  // Thêm bạn vào danh sách của tôi
  if (!me.friends) me.friends = [];
  if (!me.friends.includes(target.userCode)) {
    me.friends.push(target.userCode);
  }

  // Thêm tôi vào danh sách của bạn (kết bạn 2 chiều)
  if (!target.friends) target.friends = [];
  if (!target.friends.includes(me.userCode)) {
    target.friends.push(me.userCode);
  }

  // Cập nhật lại trong dict
  dbData.users[me.userCode] = me;
  dbData.users[target.userCode] = target;

  saveDB(dbData);
  res.json({ success: true, myFriends: me.friends });
});

// 4. Lấy danh sách bạn bè từ Server
app.get('/api/users/:code/friends', (req, res) => {
  const code = req.params.code;
  const dbData = loadDB();
  const user = findUserInDB(code, dbData);
  if (!user) {
    return res.status(404).json({ error: "Không tìm thấy người dùng" });
  }

  const friendsList = (user.friends || []).map(fCode => {
    const f = findUserInDB(fCode, dbData);
    return f ? {
      userCode: f.userCode,
      uid: f.uid,
      email: f.email,
      displayName: f.displayName,
      userAvatar: f.userAvatar
    } : {
      userCode: fCode,
      uid: '',
      email: '',
      displayName: `Người chơi #${fCode}`,
      userAvatar: ''
    };
  });

  res.json({ success: true, friends: friendsList });
});

// 5. Lấy toàn bộ các cuộc hội thoại liên quan đến userCode hiện tại
app.get('/api/conversations', (req, res) => {
  const userCode = req.query.userCode as string;
  if (!userCode) {
    return res.status(400).json({ error: "Thiếu userCode" });
  }

  const dbData = loadDB();
  // Sảnh chờ chung thì ai cũng được thấy, các nhóm khác hoặc chat riêng thì phải là thành viên
  const userConvs = dbData.conversations.filter(c => 
    c.id === 'global_chat' || (c.members && c.members.includes(userCode))
  );

  res.json({ success: true, conversations: userConvs });
});

// 6. Tạo phòng chat mới (Direct hoặc Group)
app.post('/api/conversations', (req, res) => {
  const { id, type, name, members, initialMessage } = req.body;
  if (!id || !type || !members) {
    return res.status(400).json({ error: "Thiếu thông tin phòng chat" });
  }

  const dbData = loadDB();
  // Kiểm tra xem phòng chat đã tồn tại chưa
  const existingIdx = dbData.conversations.findIndex(c => c.id === id);
  if (existingIdx !== -1) {
    const existing = dbData.conversations[existingIdx];
    // Đảm bảo các thành viên được cập nhật đầy đủ
    existing.members = Array.from(new Set([...(existing.members || []), ...members]));
    if (initialMessage) {
      const msgId = initialMessage.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const hasMsg = existing.messages.some(m => m.content === initialMessage.content && m.senderCode === initialMessage.senderCode);
      if (!hasMsg) {
        existing.messages.push({
          ...initialMessage,
          id: msgId,
          timestamp: initialMessage.timestamp || Date.now()
        });
      }
    }
    saveDB(dbData);
    return res.json({ success: true, conversation: existing });
  }

  const formattedInitialMsg = initialMessage ? {
    ...initialMessage,
    id: initialMessage.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: initialMessage.timestamp || Date.now()
  } : null;

  const newConv = {
    id,
    type,
    name,
    members,
    messages: formattedInitialMsg ? [formattedInitialMsg] : [],
    createdAt: new Date().toISOString()
  };

  dbData.conversations.push(newConv);
  saveDB(dbData);
  res.json({ success: true, conversation: newConv });
});

// 7. Gửi tin nhắn vào phòng chat
app.post('/api/conversations/:id/messages', (req, res) => {
  const convId = req.params.id;
  const { senderCode, senderName, senderAvatar, content, time } = req.body;

  if (!senderCode || !content) {
    return res.status(400).json({ error: "Thiếu thông tin tin nhắn" });
  }

  const dbData = loadDB();
  let conv = dbData.conversations.find(c => c.id === convId);
  if (!conv) {
    // Nếu chưa có hội thoại trên server, tự động khởi tạo nếu là direct chat
    if (convId.startsWith('dm_')) {
      const parts = convId.replace('dm_', '').split('_');
      conv = {
        id: convId,
        type: 'direct',
        name: `Trò chuyện`,
        members: parts,
        messages: [],
        createdAt: new Date().toISOString()
      };
      dbData.conversations.push(conv);
    } else {
      return res.status(404).json({ error: "Không tìm thấy cuộc hội thoại" });
    }
  }

  // Đảm bảo người gửi nằm trong danh sách members
  if (!conv.members.includes(senderCode)) {
    conv.members.push(senderCode);
  }

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    senderCode,
    senderName,
    senderAvatar,
    content,
    time: time || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };

  conv.messages.push(newMessage);
  saveDB(dbData);
  res.json({ success: true, message: newMessage });
});

// === API TRÍCH XUẤT DỮ LIỆU THẬT & PROXY BÌA GỐC TẤN GIANG (JJWXC) ===

const JJWXC_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'jjwxcRealData.json');

app.get('/api/jjwxc/rankings', (req, res) => {
  try {
    if (fs.existsSync(JJWXC_DATA_PATH)) {
      const raw = fs.readFileSync(JJWXC_DATA_PATH, 'utf-8');
      const data = JSON.parse(raw);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.json(data);
    }
    return res.status(404).json({ error: 'Chưa có dữ liệu JJWXC' });
  } catch (err) {
    console.error('[JJWXC API] Lỗi đọc dữ liệu:', err);
    res.status(500).json({ error: 'Lỗi nạp dữ liệu Tấn Giang' });
  }
});

// Proxy ảnh bìa gốc của JJWXC để tránh bị chặn hotlink / CORS / referrer
app.get('/api/jjwxc/image-proxy', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).send('Invalid url');
  }

  try {
    const parsed = new URL(targetUrl);
    // Cho phép jjwxc và các host ảnh phổ biến của tác giả Tấn Giang (weibo, sinaimg, bmp...)
    const allowed = parsed.hostname.endsWith('jjwxc.net') || 
                    parsed.hostname.includes('jjwxc') ||
                    parsed.hostname.includes('sinaimg.cn') || 
                    parsed.hostname.includes('weibo') || 
                    parsed.hostname.includes('loli.net') || 
                    parsed.hostname.includes('bmp.ovh') ||
                    parsed.hostname.includes('hdslb.com') ||
                    parsed.hostname.includes('bilivideo.com');

    if (!allowed) {
      return res.status(403).send('Forbidden domain');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const fetchResponse = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': targetUrl.includes('jjwxc.net') ? 'https://www.jjwxc.net/' : '',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }).finally(() => clearTimeout(timeoutId));

    if (!fetchResponse.ok) {
      return res.redirect(302, 'https://static.jjwxc.net/images/noveldefaultimage.png');
    }

    const contentType = fetchResponse.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24h
    
    const arrayBuffer = await fetchResponse.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (e) {
    console.error(`[Image Proxy] Lỗi tải ảnh ${targetUrl}:`, e);
    return res.redirect(302, 'https://static.jjwxc.net/images/noveldefaultimage.png');
  }
});

app.get('/api/jjwxc/cover/:novelId', async (req, res) => {
  const { novelId } = req.params;
  if (!novelId || !/^\d+$/.test(novelId)) {
    return res.status(400).send('Invalid novelId');
  }

  // Tìm URL bìa gốc của tác giả trong dataset (allNovels, tagRankings, rankings)
  let targetUrl = '';
  try {
    if (fs.existsSync(JJWXC_DATA_PATH)) {
      const raw = fs.readFileSync(JJWXC_DATA_PATH, 'utf-8');
      const data = JSON.parse(raw);
      
      // 1. Tìm trong allNovels
      const itemInAll = (data.allNovels || []).find((n: any) => n.novelId === novelId);
      if (itemInAll && itemInAll.coverUrl && !itemInAll.coverUrl.includes('novelimage.php?novelid=')) {
        targetUrl = itemInAll.coverUrl;
      } else {
        // 2. Tìm trong rankings
        for (const rk of Object.keys(data.rankings || {})) {
          const item = data.rankings[rk].items?.find((n: any) => n.novelId === novelId);
          if (item && item.coverUrl && !item.coverUrl.includes('novelimage.php?novelid=')) {
            targetUrl = item.coverUrl;
            break;
          }
        }
      }
    }
  } catch (err) {
    // bỏ qua nếu lỗi đọc file
  }

  // Nếu chưa có bìa riêng thật, fetch onebook.php để lấy trực tiếp thẻ img bìa tác giả
  if (!targetUrl) {
    try {
      const obRes = await fetch(`https://www.jjwxc.net/onebook.php?novelid=${novelId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.jjwxc.net/'
        }
      });
      if (obRes.ok) {
        const html = await obRes.text();
        const imgMatch = html.match(/<img[^>]*class=["']noveldefaultimage["'][^>]*>/i) || html.match(/<img[^>]*itemprop=["']image["'][^>]*>/i);
        if (imgMatch) {
          const tag = imgMatch[0];
          const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/i);
          const _srcMatch = tag.match(/\s_src=["']([^"']+)["']/i);
          const candSrc = srcMatch ? srcMatch[1] : '';
          const cand_Src = _srcMatch ? _srcMatch[1] : '';
          for (const cand of [candSrc, cand_Src]) {
            if (cand && (cand.includes('authorspace') || cand.includes('guanli/frontcover') || cand.includes('sinaimg') || cand.includes('bmp.ovh') || cand.includes('loli.net') || cand.includes('coverid='))) {
              targetUrl = cand;
              break;
            }
          }
          if (!targetUrl && candSrc) {
            targetUrl = candSrc;
          }
        }
      }
    } catch (e) {
      // bỏ qua
    }
  }

  if (!targetUrl) {
    targetUrl = `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const fetchResponse = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': targetUrl.includes('jjwxc.net') ? 'https://www.jjwxc.net/' : '',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }).finally(() => clearTimeout(timeoutId));

    if (!fetchResponse.ok) {
      return res.redirect(302, `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`);
    }

    const contentType = fetchResponse.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24h
    
    const arrayBuffer = await fetchResponse.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (e) {
    console.error(`[Cover Proxy] Lỗi tải bìa novelId ${novelId}:`, e);
    return res.redirect(302, `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`);
  }
});

// Cache chi tiết văn án đầy đủ và trạng thái chuẩn cho tác phẩm
const novelDetailCache = new Map<string, { fullIntro: string; status: string; wordCount?: string; tags?: string[]; score?: string; coverUrl?: string; isAuthorCover?: boolean }>();

app.get('/api/jjwxc/novel-detail/:novelId', async (req, res) => {
  const { novelId } = req.params;
  if (!novelId || !/^\d+$/.test(novelId)) {
    return res.status(400).json({ error: 'Mã truyện không hợp lệ' });
  }

  // 1. Kiểm tra cache bộ nhớ
  if (novelDetailCache.has(novelId)) {
    return res.json(novelDetailCache.get(novelId));
  }

  // 2. Kiểm tra trong jjwxcRealData.json
  try {
    if (fs.existsSync(JJWXC_DATA_PATH)) {
      const raw = fs.readFileSync(JJWXC_DATA_PATH, 'utf-8');
      const data = JSON.parse(raw);
      
      const allN = data.allNovels || [];
      const item = allN.find((n: any) => n.novelId === novelId);
      if (item && item.intro && item.intro.length > 80 && item.status && !item.status.includes('连载中')) {
        const result = {
          fullIntro: item.intro,
          status: item.status,
          wordCount: item.wordCount,
          tags: item.tags,
          score: item.score,
          coverUrl: item.coverUrl,
          isAuthorCover: item.isAuthorCover
        };
        novelDetailCache.set(novelId, result);
        return res.json(result);
      }
    }
  } catch (e) {
    // tiếp tục fetch
  }

  // 3. Fetch trực tiếp từ onebook.php của Tấn Giang để lấy trọn vẹn văn án gốc và bìa riêng
  try {
    const targetUrl = `https://www.jjwxc.net/onebook.php?novelid=${novelId}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const fetchRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.jjwxc.net/',
      }
    }).finally(() => clearTimeout(timeoutId));

    if (!fetchRes.ok) {
      return res.status(404).json({ error: 'Không thể tải trang truyện từ Tấn Giang' });
    }

    const buffer = await fetchRes.arrayBuffer();
    // Tấn Giang sử dụng encoding gb18030 / gbk
    const decoder = new TextDecoder('gb18030');
    const html = decoder.decode(buffer);

    // Trích xuất status chuẩn từ itemprop="updataStatus"
    let status = '完结';
    const statusMatch = html.match(/itemprop=["']updataStatus["'][^>]*>(?:<font[^>]*>)?([^<]+)/i);
    if (statusMatch && statusMatch[1]) {
      const rawSt = statusMatch[1].trim();
      if (rawSt.includes('连载')) status = '连载';
      else if (rawSt.includes('完结')) status = '完结';
      else if (rawSt.includes('暂停')) status = '暂停';
      else status = rawSt;
    }

    // Trích xuất fullIntro từ <div id="novelintro">
    let fullIntro = '';
    const introMatch = html.match(/<div[^>]*id=["']novelintro["'][^>]*>([\s\S]*?)<\/div>/i);
    if (introMatch && introMatch[1]) {
      let rawIntro = introMatch[1];
      rawIntro = rawIntro.replace(/<br\s*\/?>/gi, '\n');
      rawIntro = rawIntro.replace(/<[^>]+>/g, '');
      fullIntro = rawIntro.trim();
    }

    // Trích xuất bìa riêng của tác giả
    let coverUrl: string | undefined;
    let isAuthorCover = false;
    const imgMatch = html.match(/<img[^>]*class=["']noveldefaultimage["'][^>]*>/i) || html.match(/<img[^>]*itemprop=["']image["'][^>]*>/i);
    if (imgMatch) {
      const tag = imgMatch[0];
      const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/i);
      const _srcMatch = tag.match(/\s_src=["']([^"']+)["']/i);
      const candSrc = srcMatch ? srcMatch[1] : '';
      const cand_Src = _srcMatch ? _srcMatch[1] : '';
      if (candSrc && (candSrc.includes('authorspace') || candSrc.includes('sinaimg') || candSrc.includes('bmp.ovh') || candSrc.includes('loli.net') || candSrc.includes('frontcover') || candSrc.includes('coverid='))) {
        coverUrl = candSrc;
        isAuthorCover = true;
      } else if (cand_Src && cand_Src.includes('coverid=')) {
        coverUrl = cand_Src;
        isAuthorCover = true;
      } else if (candSrc) {
        coverUrl = candSrc;
      }
    }

    // Trích xuất số chữ nếu có
    let wordCount: string | undefined;
    const wordMatch = html.match(/itemprop=["']wordCount["'][^>]*>([^<]+)/i);
    if (wordMatch) {
      wordCount = wordMatch[1].trim();
    }

    const result = {
      fullIntro: fullIntro || 'Tác phẩm chưa có văn án công khai.',
      status,
      wordCount,
      coverUrl,
      isAuthorCover
    };

    novelDetailCache.set(novelId, result);
    return res.json(result);
  } catch (err: any) {
    console.error(`[Novel Detail] Lỗi fetch chi tiết truyện ${novelId}:`, err);
    return res.status(500).json({ error: 'Lỗi tải văn án tác phẩm' });
  }
});

// === TÍCH HỢP VITE MIDDLEWARE CHO DEVELOPMENT VÀ PRODUCTION ===

async function startServer() {
// API Cập nhật Live Tag Ranking theo thời gian thực từ Tấn Giang
app.get('/api/jjwxc/live-tag', async (req, res) => {
  const { tagId, page = '1' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);

  try {
    let fullDataset: any = {};
    if (fs.existsSync(JJWXC_DATA_PATH)) {
      fullDataset = JSON.parse(fs.readFileSync(JJWXC_DATA_PATH, 'utf-8'));
    }

    const tagRankings = fullDataset.tagRankings || {};
    const novelsList = tagRankings[tagId as string] || [];
    const PAGE_SIZE = 20;
    const totalNovels = novelsList.length;
    const totalPages = Math.max(1, Math.ceil(totalNovels / PAGE_SIZE));
    
    const startIndex = (pageNum - 1) * PAGE_SIZE;
    const pagedNovels = novelsList.slice(startIndex, startIndex + PAGE_SIZE);

    return res.json({
      success: true,
      tagId,
      page: pageNum,
      totalPages,
      totalNovels,
      crawledAt: fullDataset.crawledAt || new Date().toISOString(),
      novels: pagedNovels
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Không thể tải dữ liệu tag realtime', details: err.message });
  }
});

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Xử lý tất cả các request điều hướng SPA khi người dùng F5 hoặc gõ URL trực tiếp (ví dụ: /home, /studio, /games, /truyen/...)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200)
            .set({
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            })
            .end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Phục vụ file tĩnh trong dist với cache cho assets nhưng không cache index.html
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    app.get('*', (req, res) => {
      const distIndex = path.join(distPath, 'index.html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else {
        res.sendFile(path.join(process.cwd(), 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server chạy full-stack tại cổng http://localhost:${PORT}`);
  });
}

startServer();
