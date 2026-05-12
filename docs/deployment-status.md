# GitHub Pages 배포 상태

확인일: 2026-05-13 KST

## 현재 상태

- 최신 확인 커밋: `282a19b Trigger Pages deployment`
- GitHub Actions 워크플로: `Deploy prototype to GitHub Pages`
- 최신 실행: 실패
- 예상 배포 URL: `https://reasonofmoon.github.io/korean-edu/`
- 예상 배포 URL 현재 상태: 404

## 실패 원인

GitHub Pages 사이트가 아직 저장소에 생성/활성화되지 않았습니다.

워크플로에 `actions/configure-pages@v5`와 `enablement: true`를 넣었지만, Actions의 기본 integration token이 Pages 사이트를 새로 생성할 권한을 얻지 못했습니다.

로그 핵심:

```text
Create Pages site failed.
Resource not accessible by integration
```

최신 실행:

```text
Run: 25767067962
Commit: 282a19b
Step: Configure Pages
Result: failure
```

## 필요한 수동 조치

저장소 소유자 권한으로 GitHub에서 최초 1회 설정이 필요합니다.

1. `https://github.com/Reasonofmoon/korean-edu` 접속
2. 저장소가 private이면 GitHub Pages 사용 가능 플랜인지 확인하거나 저장소를 public으로 전환
3. `Settings > Pages` 이동
4. `Build and deployment`의 Source를 `GitHub Actions`로 설정
5. `Settings > Actions > General`에서 Workflow permissions가 배포에 필요한 권한을 허용하는지 확인
6. 저장 후 `Actions` 탭에서 `Deploy prototype to GitHub Pages`를 다시 실행하거나 빈 커밋을 푸시

## 수동 조치 후 확인

```powershell
gh run list --repo Reasonofmoon/korean-edu --limit 3
```

워크플로가 성공하면 아래 URL로 접속합니다.

```text
https://reasonofmoon.github.io/korean-edu/
```

그 다음 [수동 QA 체크리스트](manual-qa-checklist.md)를 기준으로 확인합니다.
