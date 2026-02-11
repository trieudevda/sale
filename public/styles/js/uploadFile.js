/**
 * Xem trước ảnh và kiểm tra định dạng
 * @param {string} inputId - ID của thẻ input type="file"
 * @param {string} previewId - ID của thẻ img dùng để hiển thị preview
 */
function setupImagePreview(inputId, previewId) {
    const fileInput = document.getElementById(inputId);
    const previewImg = document.getElementById(previewId);

    if (!fileInput || !previewImg) return;

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            // 1. Kiểm tra đuôi file (Extension)
            const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.svg)$/i;
            if (!allowedExtensions.test(file.name)) { // Dùng .test() sẽ nhanh và chuẩn hơn .exec()
            alert('Định dạng không hỗ trợ! (Chấp nhận: jpg, png, webp, gif, svg)');
            this.value = ''; 
            return false;
        }
if (file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
            console.warn('File có đuôi .svg nhưng MIME type không khớp.');
        }
            // 2. Kiểm tra dung lượng (Ví dụ: tối đa 2MB)
            if (file.size > 20 * 1024 * 1024) {
                alert('Dung lượng ảnh quá lớn (Tối đa 2MB)');
                this.value = '';
                return false;
            }

            // 3. Đọc và hiển thị ảnh
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                previewImg.classList.remove('hidden'); // Hiện ảnh nếu đang ẩn
            };
            reader.readAsDataURL(file);
        }
    });
}
