// ============================================================
//  📢 公告配置文件（修改此文件即可更新公告）
// ============================================================

// -------- 公告版本号（每次修改公告内容后请递增此数字） --------
var ANNOUNCEMENT_VERSION = '1.0.0';

// -------- 公告数据（按时间降序，同一天按数组顺序） --------
// ID 只需用数字，不重复即可。
// time 只写日期，格式 "YYYY-MM-DD"
// 系统会自动将同一天的多条公告在日期后加序号，如 "2026-07-20-1"
var ANNOUNCEMENT_DATA = [
    {
        id: 1,
        title: '🎉 新游戏上线！',
        content: '游戏库开服了！欢迎体验。',
        time: '2026-07-19'
    },
    {
        id: 2,
        title: '🔧 维护通知',
        content: '游戏库将于 7月20日 凌晨 2:00-4:00 进行维护，届时可能无法访问。',
        time: '2026-07-19'
    },
    {
        id: 2,
        title: '更新通知。',
        content: '我们更新了很多很多很多东西。',
        time: '2026-07-10'
    },
    // 同一天多条公告示例（如果今天有多条，系统会自动显示多条并编号）
    // {
    //     id: 3,
    //     title: '第二条今日公告',
    //     content: '这是同一天的第二条内容',
    //     time: '2026-07-20'
    // }
];

// ============================================================
//  公告系统核心代码（无需修改）
// ============================================================
(function() {
    'use strict';

    // ---------- 工具 ----------
    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
    }

    function getLocal(key, def) {
        try { var v = localStorage.getItem(key); return v !== null ? v : def; } catch(e) { return def; }
    }

    function setLocal(key, val) {
        try { localStorage.setItem(key, val); } catch(e) {}
    }

    // ---------- 处理同一天多条公告：添加后缀序号 ----------
    function processAnnouncements(raw) {
        var dateMap = {};
        var result = [];
        raw.forEach(function(item) {
            var date = item.time;
            if (!dateMap[date]) {
                dateMap[date] = 1;
                item.displayId = date;
            } else {
                dateMap[date] += 1;
                item.displayId = date + '-' + dateMap[date];
            }
            result.push(item);
        });
        // 按日期降序排序（最新在前）
        result.sort(function(a, b) {
            return new Date(b.time) - new Date(a.time);
        });
        return result;
    }

    var processedData = processAnnouncements(ANNOUNCEMENT_DATA);

    // ---------- 版本检测 ----------
    var currentVersion = getLocal('announce_version', '');
    if (currentVersion !== ANNOUNCEMENT_VERSION) {
        window._announceHasUpdate = true;
    } else {
        window._announceHasUpdate = false;
    }

    // ---------- 创建弹窗 ----------
    function createAnnouncementDialog() {
        if (document.getElementById('announcement-overlay')) return;

        var html = '';
        processedData.forEach(function(item) {
            var dateObj = new Date(item.time);
            var dateStr = dateObj.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
            html += `
                <div style="margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:16px;">
                    <div style="font-size:1.1rem;font-weight:600;color:rgba(255,255,255,0.9);margin-bottom:4px;">${item.title}</div>
                    <div style="font-size:0.85rem;color:rgba(255,255,255,0.6);margin-bottom:6px;">${item.content}</div>
                    <div style="font-size:0.7rem;color:rgba(255,255,255,0.3);">📅 ${dateStr}</div>
                </div>
            `;
        });

        var overlay = document.createElement('div');
        overlay.id = 'announcement-overlay';
        overlay.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;
        var style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @keyframes slideUp { from { transform: translateY(30px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        `;
        document.head.appendChild(style);

        overlay.innerHTML = `
            <div style="
                max-width: 600px; width: 100%;
                background: rgba(20,20,35,0.95); border:1px solid rgba(255,255,255,0.1);
                border-radius: 24px; padding: 30px 30px 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                animation: slideUp 0.3s ease;
                max-height: 80vh; overflow-y: auto;
            ">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <span style="font-size:1.5rem; font-weight:700; background:linear-gradient(135deg,#7c5cfc,#fc5c7c); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">📢 公告</span>
                    <span style="font-size:0.7rem; color:rgba(255,255,255,0.3);">版本 ${ANNOUNCEMENT_VERSION}</span>
                </div>
                <div style="max-height:50vh; overflow-y:auto; padding-right:5px;">
                    ${html || '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">暂无公告</div>'}
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; justify-content:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:18px;">
                    <button class="announce-btn close-btn" style="
                        padding:8px 24px; border-radius:60px; border:1px solid rgba(255,255,255,0.1);
                        background:rgba(255,255,255,0.04); color:#ccc; cursor:pointer; transition:0.2s;
                        font-size:0.9rem; font-family:inherit;
                    ">关闭</button>
                    <button class="announce-btn today-btn" style="
                        padding:8px 24px; border-radius:60px; border:1px solid rgba(124,92,252,0.3);
                        background:rgba(124,92,252,0.1); color:#7c5cfc; cursor:pointer; transition:0.2s;
                        font-size:0.9rem; font-family:inherit;
                    ">今日关闭</button>
                    <button class="announce-btn permanent-btn" style="
                        padding:8px 24px; border-radius:60px; border:1px solid rgba(252,92,124,0.3);
                        background:rgba(252,92,124,0.1); color:#fc5c7c; cursor:pointer; transition:0.2s;
                        font-size:0.9rem; font-family:inherit;
                    ">永久关闭</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        var closeBtn = overlay.querySelector('.close-btn');
        var todayBtn = overlay.querySelector('.today-btn');
        var permanentBtn = overlay.querySelector('.permanent-btn');

        function removeOverlay() {
            if (overlay.parentNode) overlay.remove();
        }

        closeBtn.addEventListener('click', removeOverlay);

        todayBtn.addEventListener('click', function() {
            var now = new Date();
            var year = now.getFullYear();
            var month = String(now.getMonth()+1).padStart(2,'0');
            var day = String(now.getDate()).padStart(2,'0');
            var dateStr = year + '-' + month + '-' + day;
            setCookie('announce_today', dateStr, 1);
            removeOverlay();
        });

        permanentBtn.addEventListener('click', function() {
            setCookie('announce_permanent', 'no', 3650);
            removeOverlay();
        });
    }

    // ---------- 显示公告（按钮调用） ----------
    window.showAnnouncement = function() {
        if (window._announceHasUpdate) {
            setLocal('announce_version', ANNOUNCEMENT_VERSION);
            window._announceHasUpdate = false;
            var badge = document.getElementById('announce-badge');
            if (badge) badge.style.display = 'none';
        }
        createAnnouncementDialog();
    };

    // ---------- 自动弹出判断 ----------
    function shouldShowAnnouncement() {
        if (getCookie('announce_permanent') === 'no') return false;
        var todayCookie = getCookie('announce_today');
        if (todayCookie) {
            var now = new Date();
            var year = now.getFullYear();
            var month = String(now.getMonth()+1).padStart(2,'0');
            var day = String(now.getDate()).padStart(2,'0');
            var todayStr = year + '-' + month + '-' + day;
            if (todayCookie === todayStr) return false;
        }
        return ANNOUNCEMENT_DATA && ANNOUNCEMENT_DATA.length > 0;
    }

    function initAnnouncements() {
        if (shouldShowAnnouncement()) {
            setTimeout(createAnnouncementDialog, 500);
        }
        var badge = document.getElementById('announce-badge');
        if (badge) {
            badge.style.display = window._announceHasUpdate ? 'block' : 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnnouncements);
    } else {
        initAnnouncements();
    }

})();