---
title: Fix guard
description: "Cách fix guard giữ cho eslint --fix không làm hỏng template Pug: mọi bản fix được parse lại và so sánh cấu trúc trước khi ESLint áp dụng."
---

# Fix guard

Một autofix làm hỏng template còn tệ hơn không có autofix. Pug rất dễ gặp chuyện này: thụt lề
chính là cấu trúc, và di chuyển một dòng mà không mang theo các dòng con sẽ làm đổi cây. Vì vậy
mọi bản fix đụng đến template Pug đều được kiểm tra trước khi ESLint áp dụng.

## Những gì được kiểm tra {#what-is-checked}

Với mỗi template Pug, một bản fix chỉ được áp dụng nếu sau đó template vẫn parse được và cấu trúc
không đổi:

- các tag và cách chúng lồng nhau;
- tập class và id cùng số lượng attribute của mỗi tag (nên `p(class="a b")` và `p.a.b` là như nhau,
  nhưng mất một class thì không);
- hình dạng của text và interpolation;
- mọi đoạn JavaScript mà Pug compile (giá trị attribute không có nháy và `${}`, `&attributes`,
  đối số của mixin, code, phần đầu của control, `#{}`), không tính thụt lề.

Parser báo những gì chính Pug từ chối (ví dụ trộn tab và space, hoặc lặp attribute), nên bản fix
nào gây ra lỗi đó cũng bị bỏ.

## Cách áp dụng fix {#how-fixes-are-applied}

1. Mỗi bản fix được xác minh riêng.
2. Các bản fix còn lại được xác minh một lần nữa dưới dạng tập hợp mà ESLint sẽ áp dụng.
3. Bản fix nào không qua sẽ bị bỏ, và vấn đề của nó vẫn được báo, để bạn tự sửa tay.

Điều này bao trùm mọi rule fix file `.vue`, gồm cả rule `vue/*` và rule của bên thứ ba. Khi một
template còn lỗi cú pháp Pug, không bản fix nào được áp dụng bên trong nó.

## Chi phí {#cost}

Guard parse lại template cho mỗi bản fix khác nhau, nên chi phí tăng theo số bản fix nhân với kích
thước template. Một template bình thường mất vài mili giây; một template 3000 dòng bị format sai
hoàn toàn có thể mất vài giây. Chi phí này chỉ phát sinh khi template có vấn đề cần fix.

## Tập fix áp dụng một phần {#partial-fix-sets}

Guard xác minh toàn bộ tập các bản fix còn lại. Nếu ESLint chỉ áp dụng một phần trong số đó
(`--fix-type`, hoặc một predicate `fix` tùy chỉnh trong Node.js API), thì tập con đó chưa được
xác minh như một tập hợp.
