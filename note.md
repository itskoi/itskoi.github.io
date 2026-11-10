[WAO Companion]

### Giới thiệu về app WAO

Wao là một ứng dụng ghi lại bữa ăn để theo dõi calo, giúp người dùm giảm và tăng cân.

### Cấu trúc của WAO

Team product gồm khoảng 6 người và em là AI Engineer duy nhất trong team.

### Các dự án đã tham gia

Tính đến thời điểm hiện tại, em đã tham gia 3 projects.
Cải thiện tìm kiếm cho tính năng ghi bữa ăn bằng giọng nói, hệ thống gợi ý bữa ăn, và health agent trợ lý dinh dưỡng cho người dùng. Bên cạnh đó, em góp phần chuyển đổi team dev từ vibe coding sang spec driven dev.

### Quá trình làm một dự án

Brainstorm ý tưởng -> Làm POC -> Làm bộ đánh giá -> Integrate với hệ thống hiện tại -> Chạy thử -> Đo lường dựa trên đánh giá đã có với dữ liệu thực tế.

### Chi tiết về dự án

#### Cải tiến hệ thống search cho tính nắng ghi món ăn bằng giọng nói (Voice log).

- Mô tả tính năng: người dùng nói những món ăn và khẩu phần của món đó, hệ thống sẽ tự đồng tìm món tương ứng trong DB, và ghi vào nhật ký ăn uống của người đó.
- Yêu cầu của bài toán:
  - Không muốn dùng semantic search, chỉ dùng keyword based search.
  - Muốn cải thiện Recall@3 từ 60% lên khoảng 80%.
- Luồng search trước khi cải tiến: Recognized voice text -> LLM -> structured output which is list of items.
  Ví dụ: tôi muốn ăn canh khổ qua dồn thịt -> canh khổ qua dồn thịt.
  Trong DB sẽ có item tương ứng là Canh mướp đắng nhồi thịt heo xay; Canh mướp đắng dồn thịt cá thác lác.
- Phân tích vấn đề:
  1. Nhập nhằng từ ngữ: nhồi != dồn; nếu nói dồn thịt thì thịt ở đây là thịt gì?
  2. Đa dạng tên gọi cho vùng miền: mướp đắng và khổ qua
- Cách cải thiện: rewritten query và preclassified tags for items in DB.
  - Classified tags: processed, cooked, raw, vegetable, fish, pork, beef, ...
  - Rewruitten query: extract tags, matching ingredients also.
- Cách thu thập bộ test:
  - 500 cases từ người dùng thực tế.
  - Ground truth label là item người dùng ghi vào nhất ký ăn uống.
- Kết quả: Recall@3 tăng lên 90% k-fold với k = 5.

#### Meal Suggestion

- Mô tả tính năng: dựa trên thông tin về calo, macro, món ăn người dùng yêu thích và nhật ký ăn uống của người đùng → gợi ý bữa ăn phù hợp (về dinh dưỡng và sở thích)
- Yêu cầu của bài toán:
  - Recall@ 10
