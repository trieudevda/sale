import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight'; // Thêm { }
import { Underline } from '@tiptap/extension-underline'; // Thêm { }
import { Link } from '@tiptap/extension-link';           // Thêm { }
import { TextAlign } from '@tiptap/extension-text-align'; // Thêm { }
import { Image } from '@tiptap/extension-image';         // Thêm { }
import  YouTube  from '@tiptap/extension-youtube';     // Thêm { }
import { TextStyle } from '@tiptap/extension-text-style'; // Thêm { }
import { FontFamily } from '@tiptap/extension-font-family'; // Thêm { }
import { Color } from '@tiptap/extension-color';
import { Bold } from '@tiptap/extension-bold';           // Thêm { }



window.addEventListener('load', function() {
    if (document.getElementById("wysiwyg-example")) {

    const FontSizeTextStyle = TextStyle.extend({
        addAttributes() {
            return {
            fontSize: {
                default: null,
                parseHTML: element => element.style.fontSize,
                renderHTML: attributes => {
                if (!attributes.fontSize) {
                    return {};
                }
                return { style: 'font-size: ' + attributes.fontSize };
                },
            },
            };
        },
    });
    const CustomBold = Bold.extend({
        // Override the renderHTML method
        renderHTML({ mark, HTMLAttributes }) {
            const { style, ...rest } = HTMLAttributes;

            // Merge existing styles with font-weight
            const newStyle = 'font-weight: bold;' + (style ? ' ' + style : '');

            return ['span', { ...rest, style: newStyle.trim() }, 0];
        },
        // Ensure it doesn't exclude other marks
        addOptions() {
            return {
                ...this.parent?.(),
                HTMLAttributes: {},
            };
        },
    });
    // tip tap editor setup
    const editor = new Editor({
        element: document.querySelector('#wysiwyg-example'),
        extensions: [
            StarterKit.configure({
                textStyle: false,
                bold: false,
                marks: {
                    bold: false,
                },
            }),
            // Include the custom Bold extension
            CustomBold,
            // TextStyle,
            Color,
            FontSizeTextStyle,
            FontFamily,
            Highlight,
            // Underline,
            // Link.configure({
            //     openOnClick: false,
            //     autolink: true,
            //     defaultProtocol: 'https',
            // }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image,
            YouTube,
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'format lg:format-lg dark:format-invert focus:outline-none format-blue max-w-none',
            },
        }
    });
    editor.on('update', ({ editor }) => {
        const html = editor.getHTML();
        document.getElementById('formdata-WYSIWYG').value = html;
    });
    // Lấy dữ liệu từ input
    const dataFromServer = document.getElementById('formdata-WYSIWYG').value;
    console.log(dataFromServer)
    // Gán vào editor
    if (dataFromServer) {
        editor.commands.setContent(dataFromServer); //
    }
    document.getElementById('saveButton').addEventListener('submit', () => {
        const html = editor.getHTML();
        document.getElementById('formdata-WYSIWYG').value = html;
        console.log('Saved content:', html);
    });

    // set up custom event listeners for the buttons
    document.getElementById('toggleBoldButton').addEventListener('click', () => editor.chain().focus().toggleBold().run());
    document.getElementById('toggleItalicButton').addEventListener('click', () => editor.chain().focus().toggleItalic().run());
    document.getElementById('toggleUnderlineButton').addEventListener('click', () => editor.chain().focus().toggleUnderline().run());
    document.getElementById('toggleStrikeButton').addEventListener('click', () => editor.chain().focus().toggleStrike().run());
    document.getElementById('toggleHighlightButton').addEventListener('click', () => {
    const isHighlighted = editor.isActive('highlight');
    // when using toggleHighlight(), judge if is is already highlighted.
    editor.chain().focus().toggleHighlight({
        color: isHighlighted ? undefined : '#ffc078'
    }).run();
    });

    document.getElementById('toggleLinkButton').addEventListener('click', () => {
        const url = window.prompt('Enter image URL:', 'https://flowbite.com');
        editor.chain().focus().toggleLink({ href: url }).run();
    });
    document.getElementById('removeLinkButton').addEventListener('click', () => {
        editor.chain().focus().unsetLink().run()
    });
    document.getElementById('toggleCodeButton').addEventListener('click', () => {
        editor.chain().focus().toggleCode().run();
    })

    document.getElementById('toggleLeftAlignButton').addEventListener('click', () => {
        editor.chain().focus().setTextAlign('left').run();
    });
    document.getElementById('toggleCenterAlignButton').addEventListener('click', () => {
        editor.chain().focus().setTextAlign('center').run();
    });
    document.getElementById('toggleRightAlignButton').addEventListener('click', () => {
        editor.chain().focus().setTextAlign('right').run();
    });
    document.getElementById('toggleListButton').addEventListener('click', () => {
       editor.chain().focus().toggleBulletList().run();
    });
    document.getElementById('toggleOrderedListButton').addEventListener('click', () => {
        editor.chain().focus().toggleOrderedList().run();
    });
    document.getElementById('toggleBlockquoteButton').addEventListener('click', () => {
        editor.chain().focus().toggleBlockquote().run();
    });
    document.getElementById('toggleHRButton').addEventListener('click', () => {
        editor.chain().focus().setHorizontalRule().run();
    });
        document.getElementById('addImageButton').addEventListener('click', function() {
            // 1. Khai báo các thành phần Modal (Đảm bảo ID này có trong HTML của bạn)
            var modal = document.getElementById('lfmModal');
            var iframe = document.getElementById('lfmIframe');
            var route_prefix = '/filemanager';

            // 2. Tạo URL và load vào Iframe thay vì mở cửa sổ mới
            var lfm_url = route_prefix + '?type=Images&v=' + Math.random();

            if (iframe && modal) {
                iframe.src = lfm_url;
                modal.classList.remove('hidden'); // Hiển thị Modal Tailwind
                modal.style.display = 'flex';     // Đảm bảo hiển thị dạng flex
            } else {
                console.error("Không tìm thấy Modal hoặc Iframe!");
                return;
            }

            // 3. Định nghĩa hàm nhận kết quả (Giữ nguyên logic xử lý ảnh của bạn)
            // 3. Định nghĩa hàm nhận kết quả
            window.SetUrl = function (items) {
                // Lấy URL an toàn
                const url = Array.isArray(items) ? (items[0] ? items[0].url : items.url) : items.url;

                if (url) {
                    editor.chain()
                        .focus()
                        // Giải phóng vùng chọn hiện tại (nếu đang lỡ tay bấm vào ảnh cũ)
                        .deleteSelection()
                        // Chèn ảnh mới
                        .insertContent({
                            type: 'image',
                            attrs: { src: url }
                        })
                        // QUAN TRỌNG: Tạo một dòng mới ngay sau ảnh và nhảy con trỏ xuống đó
                        .createParagraphNear()
                        .focus('end')
                        .run();

                    if (typeof toastr !== 'undefined') {
                        toastr.success('Đã chèn ảnh thành công!');
                    }
                }

                closeLfm();
            };


            // Hàm đóng modal và dọn dẹp
            function closeLfm() {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                iframe.src = '';      // Xóa src để tránh tải ngầm
                window.SetUrl = null; // Xóa callback để tránh xung đột lần sau
            }

            // Gán sự kiện đóng cho nút X bên trong modal (nếu có)
            const closeBtn = document.getElementById('closeLfmModal');
            if (closeBtn) closeBtn.onclick = closeLfm;
        });


        // document.getElementById('addImageButton').addEventListener('click', () => {
    //     const url = window.prompt('Enter image URL:', 'https://placehold.co/600x400');
    //     if (url) {
    //         editor.chain().focus().setImage({ src: url }).run();
    //     }
    // });
    document.getElementById('addVideoButton').addEventListener('click', () => {
        const url = window.prompt('Enter YouTube URL:', '');
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
            })
        }
    });

    // typography dropdown
    const typographyDropdown = FlowbiteInstances.getInstance('Dropdown', 'typographyDropdown');

    document.getElementById('toggleParagraphButton').addEventListener('click', () => {
        editor.chain().focus().setParagraph().run();
        typographyDropdown.hide();
    });

    document.querySelectorAll('[data-heading-level]').forEach((button) => {
        button.addEventListener('click', () => {
            const level = button.getAttribute('data-heading-level');
            editor.chain().focus().toggleHeading({ level: parseInt(level) }).run()
            typographyDropdown.hide();
        });
    });

    const textSizeDropdown = FlowbiteInstances.getInstance('Dropdown', 'textSizeDropdown');

    // Loop through all elements with the data-text-size attribute
    document.querySelectorAll('[data-text-size]').forEach((button) => {
        button.addEventListener('click', () => {
            const fontSize = button.getAttribute('data-text-size');

            // Apply the selected font size via pixels using the TipTap editor chain
            editor.chain().focus().setMark('textStyle', { fontSize }).run();

            // Hide the dropdown after selection
            textSizeDropdown.hide();
        });
    });

    // Listen for color picker changes
    const colorPicker = document.getElementById('color');
    colorPicker.addEventListener('input', (event) => {
        const selectedColor = event.target.value;

        // Apply the selected color to the selected text
        editor.chain().focus().setColor(selectedColor).run();
    })

    document.querySelectorAll('[data-hex-color]').forEach((button) => {
        button.addEventListener('click', () => {
            const selectedColor = button.getAttribute('data-hex-color');

            // Apply the selected color to the selected text
            editor.chain().focus().setColor(selectedColor).run();
        });
    });

    document.getElementById('reset-color').addEventListener('click', () => {
        editor.commands.unsetColor();
    })

    const fontFamilyDropdown = FlowbiteInstances.getInstance('Dropdown', 'fontFamilyDropdown');

    // Loop through all elements with the data-font-family attribute
    document.querySelectorAll('[data-font-family]').forEach((button) => {
        button.addEventListener('click', () => {
            const fontFamily = button.getAttribute('data-font-family');

            // Apply the selected font size via pixels using the TipTap editor chain
            editor.chain().focus().setFontFamily(fontFamily).run();

            // Hide the dropdown after selection
            fontFamilyDropdown.hide();
        });
    });
}
})
