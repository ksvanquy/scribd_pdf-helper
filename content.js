// ---------- Hàm xóa toolbar và container ----------
function cleanPage() {
    const top = document.querySelector(".toolbar_top");
    if (top) top.remove();

    const bottom = document.querySelector(".toolbar_bottom");
    if (bottom) bottom.remove();

    const containers = document.querySelectorAll(".document_scroller");
    containers.forEach(c => c.className = '');

    console.log("🧹 Toolbar và container đã được xóa!");
}

// ---------- Chờ tất cả canvas / img load ----------
function waitForAllPagesAndClearSafe(callback) {
    const observer = new MutationObserver((mutations, obs) => {
        const pages = document.querySelectorAll("[class*='page']");
        let allLoaded = true;

        pages.forEach(page => {
            const canvas = page.querySelector("canvas");
            if (canvas && canvas.width === 0) allLoaded = false;

            const img = page.querySelector("img");
            if (img && !img.complete) allLoaded = false;
        });

        if (allLoaded && pages.length > 0) {
            obs.disconnect();
            console.log("✅ All pages loaded (safe)!");
            if (callback) callback();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// ---------- Tạo thẻ style chung ----------
function addGlobalStyles() {
    const style = document.createElement("style");
    style.id = "scribdExtensionStyles";
    style.textContent = `
        /* ===== Button chung ===== */
        #scribdPrintBtn, #scribdCleanBtn, #scribdAutoScrollBtn {
            position: fixed;
            right: 20px;
            z-index: 999999;
            padding: 12px 18px;
            color: white;
            font-size: 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
        }
        #scribdPrintBtn { top: 20px; background: #ff5722; }
        #scribdCleanBtn { top: 60px; background: #2196f3; }
        #scribdAutoScrollBtn { top: 100px; background: #4caf50; }

        /* ===== Ẩn khi in ===== */
        @media print {
            #scribdPrintBtn, #scribdCleanBtn, #scribdAutoScrollBtn {
                display: none !important;
            }
            @page { margin: 0; }
            body, html { margin:0; padding:0; overflow: visible !important; }
            .document_scroller {
                transform: scale(0.8);
                transform-origin: top left;
                display: block;
                page-break-after: always;
            }
            .toolbar_top, .toolbar_bottom { display: none !important; }
        }
    `;
    document.head.appendChild(style);
}

// ---------- Tạo các nút ----------
function createPrintButton() {
    const btn = document.createElement("button");
    btn.textContent = "Print PDF";
    btn.id = "scribdPrintBtn";

    btn.onclick = () => {
        console.log("🖨 Thêm CSS in...");
        // Ẩn nút trước khi print
        btn.style.display = "none";

        setTimeout(() => {
            console.log("🖨 Mở hộp thoại in...");
            window.print();

            // hiện lại nút sau khi print
            setTimeout(() => { btn.style.display = "block"; }, 500);
        }, 300);
    };

    document.body.appendChild(btn);
}

function createCleanPageButton() {
    const btn = document.createElement("button");
    btn.textContent = "Clean Page";
    btn.id = "scribdCleanBtn";

    btn.onclick = () => {
        console.log("🧹 Manual clean triggered");
        cleanPage();
        waitForAllPagesAndClearSafe();
    };

    document.body.appendChild(btn);
}

function createAutoScrollButton() {
    let scrollInterval = null;
    const scrollSpeed = 120;
    const btn = document.createElement("button");
    btn.textContent = "Auto Scroll";
    btn.id = "scribdAutoScrollBtn";

    btn.onclick = () => {
        const container = document.querySelector(".document_scroller") || document.body;

        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
            btn.textContent = "Auto Scroll";
            console.log("⏸ Auto scroll stopped");
        } else {
            btn.textContent = "Stop Scroll";
            scrollInterval = setInterval(() => {
                container.scrollBy(0, scrollSpeed);
                if ((container.scrollTop + container.clientHeight) >= container.scrollHeight) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                    btn.textContent = "Auto Scroll";
                    console.log("✅ Reached bottom, auto scroll stopped");
                }
            }, 200);
            console.log("▶ Auto scroll started");
        }
    };

    document.body.appendChild(btn);
}

// ---------- Khởi tạo extension ----------
window.addEventListener("load", () => {
    addGlobalStyles();
    createPrintButton();
    createCleanPageButton();
    createAutoScrollButton();
    waitForAllPagesAndClearSafe();
    console.log("✅ Extension loaded, waiting for pages...");
});