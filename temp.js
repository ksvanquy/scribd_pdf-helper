// Xóa toolbar và container
function cleanPage() {
    const top = document.querySelector(".toolbar_top");
    if (top) top.remove();

    const bottom = document.querySelector(".toolbar_bottom");
    if (bottom) bottom.remove();
}

function waitForAllPagesAndClear() {
    const observer = new MutationObserver((mutations, obs) => {
        const pages = document.querySelectorAll("[class*='page']");
        let allLoaded = true;

        pages.forEach(page => {
            // Nếu canvas hoặc img bên trong chưa có dữ liệu
            const canvas = page.querySelector("canvas");
            if (canvas && canvas.width === 0) allLoaded = false;
            const img = page.querySelector("img");
            if (img && !img.complete) allLoaded = false;
        });

        if (allLoaded && pages.length > 0) {
            // Tất cả trang đã load
            obs.disconnect(); // ngừng quan sát

            // Xóa class document_scroller
            const containers = document.querySelectorAll(".document_scroller");
            containers.forEach(c => c.className = '');

            console.log("✅ All pages loaded, containers cleared!");
        }
    });

    // Quan sát body để detect khi pages được load
    observer.observe(document.body, { childList: true, subtree: true });
}


function addPrintStyles() {
    const style = document.createElement("style");
    style.textContent = `
        @media print {
            @page {
                margin: 0;
            }
            body, html {
                margin: 0;
                padding: 0;
                overflow: visible !important;
            }
            .document_scroller {
                transform: scale(0.8);
                transform-origin: top left;
                display: block;
                page-break-after: always;
            }
            .toolbar_top, .toolbar_bottom {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function createPrintButton() {
    const btn = document.createElement("button");
    btn.textContent = "Print PDF";
    btn.id = "scribdPrintBtn";

    Object.assign(btn.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "999999",
        padding: "12px 18px",
        background: "#ff5722",
        color: "white",
        fontSize: "16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
    });

    btn.onclick = () => {
        console.log("🖨 Thêm CSS in...");

        addPrintStyles(); // gọi style in

        // Ẩn nút trước khi mở hộp thoại in
        btn.style.display = "none";

        setTimeout(() => {
            console.log("🖨 Mở hộp thoại in...");
            window.print();

            // Sau khi in xong → hiện lại nút
            setTimeout(() => {
                btn.style.display = "block";
            }, 500);

        }, 300);
    };

    document.body.appendChild(btn);

    // ✅ Ẩn nút khi chế độ print preview
    const hidePrintBtnCSS = document.createElement("style");
    hidePrintBtnCSS.textContent = `
        @media print {
            #scribdPrintBtn {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(hidePrintBtnCSS);
}

window.addEventListener("load", () => {
    cleanPage();
    createPrintButton();
    waitForAllPagesAndClear();
    console.log("✅ Page cleaned, print styles added, waiting for pages to load...");
});