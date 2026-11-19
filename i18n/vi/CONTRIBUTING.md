<sub>[English](../../CONTRIBUTING.md) | **Tiếng Việt** | [한국어](../ko/CONTRIBUTING.md) | [简体中文](../zh/CONTRIBUTING.md) | [日本語](../ja/CONTRIBUTING.md) | [Deutsch](../de/CONTRIBUTING.md) | [Français](../fr/CONTRIBUTING.md) | [Español](../es/CONTRIBUTING.md) | [हिन्दी](../hi/CONTRIBUTING.md) | [Português (Brasil)](../pt/CONTRIBUTING.md) | [Русский](../ru/CONTRIBUTING.md)</sub>

# Hướng dẫn đóng góp

> Bản dịch này có thể chậm hơn bản tiếng Anh. Nếu có chỗ không khớp, [bản tiếng Anh](../../CONTRIBUTING.md) là bản chính thức.

Cảm ơn bạn đã muốn giúp một tay. Báo lỗi, sửa tài liệu hay pull request đều được hoan nghênh.

Mọi người tham gia đều được kỳ vọng tuân theo [Quy tắc ứng xử](./CODE_OF_CONDUCT.md).

## Trước khi bắt đầu

- **Bug hoặc sửa nhỏ?** Cứ mở pull request thẳng, hoặc mở issue nếu bạn không chắc đó có phải bug.
  Một báo cáo bug hữu ích nhất khi kèm file `.vue` nhỏ nhất tái hiện được lỗi và
  `eslint.config.js` của bạn.
- **Rule mới, option mới hoặc thay đổi một giá trị mặc định?** Hãy mở issue trước để cùng thống
  nhất hướng đi trước khi bạn viết code.

## Thiết lập

Dùng phiên bản Node trong [`.nvmrc`](../../.nvmrc) (`nvm use`). Repository là một workspace
[pnpm](https://pnpm.io); `corepack enable` cho bạn đúng phiên bản pnpm được ghim trong
`package.json`.

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| Đường dẫn | Nó là gì |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: parser CST cho Pug. |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: tokenizer cho vue-eslint-parser, processor (suppress + fix guard), các config và các rule `vue-pug/*`. |
| `docs` | Site tài liệu VitePress. |
| `examples/vue-pug` | Một dự án Vue nhỏ để thử plugin bằng tay (`docs/manual-test.md`). |

## Nguyên tắc cơ bản

1. **Không bao giờ sửa tay các file được sinh ra.**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` và
     `packages/eslint-plugin/docs/vue-compatibility.md` được sinh từ compatibility harness: chạy
     `pnpm -C packages/eslint-plugin compat`. Các quyết định làm tay nằm trong
     `packages/eslint-plugin/tools/compat/overrides.ts`.
   - Các đoạn nằm giữa marker `<!-- begin auto-generated … -->` (bảng rule, danh sách rule
     `vue/*`) được sinh từ `pnpm -C packages/eslint-plugin docs:gen`.
2. **Một bản fix không bao giờ được thay đổi những gì template render ra.** Fix guard bắt được hầu
   hết lỗi, nhưng test của một rule nên chứng minh các bản fix của nó sạch: harness all-rules trong
   `packages/eslint-plugin/tests/all-rules` compile mọi fixture bằng `pug` thật trước và sau khi
   fix.
3. **Rule mới?** Thêm `src/rules/<name>.ts` (dùng `createPugRule`), đăng ký nó trong
   `src/rules/index.ts`, thêm `tests/rules/<name>.test.ts` và `docs/rules/<name>.md`. Tài liệu cần
   ít nhất hai ví dụ `Incorrect` và hai ví dụ `Correct`: chúng được lint bởi các test của docs. Sau
   đó chạy `docs:gen` và thêm trang trên site `docs/rules/<name>.md` (một dòng `<!--@include: -->`,
   như các trang khác).
4. **Giữ fixture đúng từng byte.** Một số fixture test đầu vào CRLF, BOM và tab; `.gitattributes`
   giữ chúng nguyên trạng. Đừng để editor của bạn chuẩn hóa chúng.
5. **Thêm test** cho mọi thay đổi hành vi, trong parser hoặc plugin.

## Trước khi mở pull request

Chạy cùng các bước kiểm tra mà CI chạy:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

Sau đó:

- **Thêm một changeset** cho mọi thứ mà người dùng package sẽ nhận ra: chạy `pnpm changeset`, chọn
  các package và mức bump, rồi viết một hai dòng cho changelog. Thay đổi chỉ về tài liệu và thay
  đổi nội bộ không cần.
- **Đặt tiêu đề PR theo kiểu [Conventional Commits](https://www.conventionalcommits.org/)**:
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`. Đánh dấu breaking change
  bằng `!` (`feat!: ...`).
- Mỗi pull request chỉ một thay đổi.

## Điều gì xảy ra sau khi bạn mở pull request

- Nếu đây là đóng góp đầu tiên của bạn, GitHub Actions chờ một maintainer duyệt lần chạy CI. Đó là
  cơ chế bảo vệ của GitHub cho pull request từ fork, không phải đánh giá về thay đổi của bạn.
- Maintainer review và merge. Changeset của bạn sau đó xuất hiện trong pull request "Version
  Packages" kế tiếp, và được phát hành khi pull request đó được merge (xem [Phát hành](#phát-hành)).

## Phát hành

Việc phát hành được tự động hóa bằng [changesets](https://github.com/changesets/changesets) và
[`release.yml`](../../.github/workflows/release.yml):

1. Mỗi lần push lên `main` có changeset đang chờ sẽ mở hoặc cập nhật một pull request **Version
   Packages**, nơi tăng phiên bản và ghi `CHANGELOG.md` của từng package.
2. Merge pull request đó sẽ publish các phiên bản mới lên npm kèm provenance, qua npm Trusted
   Publishing (không lưu token nào), và tạo một GitHub release cho mỗi package.

Pull request Version Packages được mở bằng token riêng của workflow, và GitHub không khởi chạy các
workflow khác cho sự kiện do token đó tạo ra, nên CI không tự chạy trên nó. Để có kết quả CI cho
nó, hãy đóng rồi mở lại pull request (hoặc tự push một commit lên branch của nó).

<details>
<summary><strong>Thiết lập một lần (maintainer)</strong></summary>

Các package được publish từ tài khoản npm cá nhân của maintainer. Trusted Publishing chỉ cấu hình
được trên package đã tồn tại trên npm, nên phiên bản đầu tiên được publish bằng tay:

1. Trên GitHub: Settings → Actions → General → cho phép GitHub Actions tạo và duyệt pull request
   (changesets cần điều này để mở pull request Version Packages).
2. Merge pull request Version Packages đầu tiên. Job publish của nó sẽ thất bại, vì chưa có trusted
   publisher nào được thiết lập; điều này là bình thường.
3. Trên `main` đã cập nhật: `npm login`, `pnpm install && pnpm build`, rồi `pnpm pack` trong
   `packages/pug-parser` và trong `packages/eslint-plugin` (`pnpm pack` thay `workspace:*` bằng
   phiên bản thật). Trong một terminal thật, `npm publish ./<file>.tgz --access public`, parser
   trước; npm yêu cầu 2FA trong trình duyệt. npm đặt một bản publish từ máy cá nhân vào trạng thái
   staged: package hiện một placeholder `0.0.0-stage` cho đến khi bạn duyệt phiên bản staged trên
   npmjs.com.
4. Trên npmjs.com, với mỗi package: Settings → Trusted Publisher → GitHub Actions, repository
   `HQCuong/pug-lint`, workflow `release.yml`. Sau đó mở lần chạy release bị lỗi và dùng
   **Re-run failed jobs** (hoặc push một commit bất kỳ lên `main`): nó bỏ qua các phiên bản đã có
   trên npm và tạo các GitHub release còn thiếu.

</details>

## Bảo mật

Phát hiện một lỗ hổng? Đừng mở issue; xem [SECURITY.md](./SECURITY.md).

## Giấy phép

Khi đóng góp, bạn đồng ý rằng các đóng góp của bạn được cấp phép theo [Giấy phép MIT](../../LICENSE).
