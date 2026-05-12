# GitHub Pages 배포 상태

확인일: 2026-05-13 KST

## 현재 상태

- 최신 확인 커밋: `1eaed19 Expand prototype data to all vocabulary`
- GitHub Actions 워크플로: `Deploy prototype to GitHub Pages`
- 최신 실행: 실패
- 예상 배포 URL: `https://reasonofmoon.github.io/korean-edu/`
- 예상 배포 URL 현재 상태: 404

## 실패 원인

GitHub Pages 사이트가 아직 저장소에 생성/활성화되지 않았습니다.

저장소는 public으로 전환되었지만, `Settings > Actions > General > Workflow permissions`가 `Read repository contents permission` 상태입니다.

워크플로에 `actions/configure-pages@v5`와 `enablement: true`를 넣었지만, Actions의 기본 integration token이 Pages 사이트를 새로 생성할 권한을 얻지 못했습니다.

로그 핵심:

```text
Create Pages site failed.
Resource not accessible by integration
```

최신 실행:

```text
Run: 25768975452
Commit: 1eaed19
Step: Configure Pages
Result: failure
```

## 필요한 수동 조치

저장소 소유자 권한으로 GitHub에서 최초 1회 설정이 필요합니다.

1. `https://github.com/Reasonofmoon/korean-edu` 접속
2. `Settings > Actions > General`로 이동
3. `Workflow permissions`를 `Read and write permissions`로 변경
4. 저장
5. `Settings > Pages` 이동
6. `Build and deployment`의 Source를 `GitHub Actions`로 설정
7. 저장 후 `Actions` 탭에서 `Deploy prototype to GitHub Pages`를 다시 실행하거나 빈 커밋을 푸시

대안으로 Netlify에 저장소를 연결하면 `netlify.toml` 설정으로 `prototype/` 폴더를 바로 정적 배포할 수 있습니다.

## 수동 조치 후 확인

```powershell
gh run list --repo Reasonofmoon/korean-edu --limit 3
```

워크플로가 성공하면 아래 URL로 접속합니다.

```text
https://reasonofmoon.github.io/korean-edu/
```

그 다음 [수동 QA 체크리스트](manual-qa-checklist.md)를 기준으로 확인합니다.
