# GRAND SUN 실적 대시보드 (초안)

월간 실적발표용 웹 대시보드입니다. 별도 빌드 없이 정적 파일로 동작합니다.

| 파일 | 내용 |
|---|---|
| `index.html` | **탐색 대시보드** – 왼쪽 사이드바에서 연도(2025/2026)·월(복수선택)·구분(직영/외주/입찰)·담당자·지사·지역·사업타입·용량구간·유입을 선택하면 합계와 분석이 즉시 갱신 |
| `data.enc.js` | 엑셀 사업별 시트의 계약 행 전체(584건) + 정리base 월별 목표 (암호화) |
| `gate.js` | 비밀번호 입력 화면·복호화 |
| `report-2026-09.html` | 26년 9월 발표자료(PPT 재구성, 고정 수치) |

## 접속 비밀번호
- 두 페이지 모두 비밀번호를 입력해야 열립니다. 데이터 파일(`data.enc.js`, `report-data.enc.js`)이 비밀번호로 암호화(AES-256-GCM)되어 있어, 비밀번호 없이는 저장소를 열어봐도 숫자를 볼 수 없습니다.
- 평문 `data.js`, `report-data.js`는 `.gitignore`로 제외됩니다. **저장소에 올리지 마세요.**
- 비밀번호 변경: `python3 tools/encrypt.py <새비밀번호>` 실행 후 `.enc.js` 두 파일을 올리면 됩니다.
- "로그인 유지"를 체크하면 그 브라우저에 저장되고, 사이드바 `로그아웃`으로 지웁니다.

## 비교 모드
- 사이드바 연도 옆 **비교** 버튼 → 2025년과 2026년을 같은 월·같은 필터로 나란히 비교 (KPI, 월별 차트·표, 담당자/타입/지사/지역/용량구간/유입별 증감, 담당자×월, 계약 목록).

## 탐색 대시보드 (index.html)
- 월 버튼: 클릭으로 복수 선택, Shift+클릭 구간 선택, `전체/해제/누적`
- 목표 대비는 선택한 구분(직영/외주/입찰)의 정리base 월별 목표를 합산
- 용량 구간(100/300/500/1,000kW)은 대시보드에서 임의로 나눈 기준
- 지사 구분은 엑셀 `지역` 시트의 안성지사/부산지사 분류
- 데이터 갱신: 아래 **자동 갱신** 참고 (수동은 `python3 tools/extract.py 2025.xlsx 2026.xlsx > data.js` → `python3 tools/encrypt.py <비밀번호>` → `data.enc.js` 업로드)

## 자동 갱신 (GitHub Actions)
`source/` 폴더에 RPS 엑셀을 넣고 푸시하면 GitHub가 자동으로 `data.enc.js`를 만들어 반영합니다. 사람이 할 일은 **엑셀 복사 → 커밋 → 푸시** 뿐입니다.

### 최초 1회 설정
1. 저장소 **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `DASH_PASSWORD`, Secret: 대시보드 비밀번호 → Add secret
2. 저장소 **Settings → Actions → General → Workflow permissions**에서 **Read and write permissions** 선택 → Save
3. (처음 한 번) **Actions** 탭 → "Update dashboard data" → **Run workflow**로 수동 실행해 초록색 체크가 뜨는지 확인

### 매월 갱신 (GitHub Desktop)
1. GitHub Desktop에서 `File → Clone repository`로 `sttvtts1-gif/tlfwjr`을 PC에 받아둡니다 (최초 1회)
2. 새 엑셀을 PC의 저장소 폴더 안 `source/`에 복사합니다 (파일명에 연도 포함, 예 `2026년_RPS프로젝트_2026-10-15.xlsx`)
3. GitHub Desktop 왼쪽에 변경 파일이 뜨면 아래 Summary에 아무 메모(예 "10월 실적") 입력 → **Commit to main** → 상단 **Push origin**
4. 1~3분 뒤 Actions 탭이 초록색이면 완료. 대시보드 새로고침(Ctrl+F5)

### 주의
- 이 저장소가 **공개(Public)** 이면 `source/`의 엑셀 원본도 누구나 내려받을 수 있습니다. 대시보드 숫자는 암호화되지만 엑셀은 그대로입니다.
  - 해결 A: 저장소를 Private으로 전환 (단, GitHub Pages는 유료 플랜(Pro)에서만 Private 저장소 지원)
  - 해결 B: 엑셀 전용 **비공개 저장소**를 따로 만들어 거기에 `source/`, `tools/`, `.github/`를 두고, Variable `TARGET_REPO=sttvtts1-gif/tlfwjr`와 Secret `TARGET_TOKEN`(fine-grained PAT, tlfwjr에 Contents: Read and write)을 설정하면 공개 저장소에는 `data.enc.js`만 넘어갑니다.
- 발표자료 페이지(`report-2026-09.html`)의 숫자·리뷰 문구는 PPT 기반이라 자동 갱신 대상이 아닙니다.

## 발표자료 구성 (report-2026-09.html)
1. 표지 · 핵심 KPI
2. 월 실적 (전체/부산/경기, 전월대비, 달성율)
3. 유입 (직접/소개 – 용량·건수)
4. 계약타입 (발전사업/자가소비/임대/건물지원)
5. 개인별 월/누적 실적
6. 분기 실적
7. 2025·2026 월별 추이 및 예상
8. 익월 계약 가능건/확정건
9. 종합분석 및 개선방안

## 발표 모드
- `→ / ↓ / Space / PageDown` 다음 섹션, `← / ↑ / PageUp` 이전 섹션
- `F` 또는 우측 상단 **전체화면**
- **테마** 버튼으로 라이트/다크 전환

## 발표자료 업데이트
`report-2026-09.html` 상단의 `const DATA = { ... }` 블록만 수정하면 전체 화면이 갱신됩니다.

## 데이터 출처 (2026년 9월분)
- `26년_9월_발표_필드.pptx`에 기재된 수치를 그대로 옮겼습니다.
- 원본: `2026년_RPS프로젝트_2026-09-18.xlsx`, `2025년_RPS프로젝트_2025-11-27.xlsx`

## GitHub Pages 배포
Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)` 선택
