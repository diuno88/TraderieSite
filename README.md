# TraderieAlarm 서비스 구성 및 배포 안내

## 1. 서비스 개요
- FastAPI 기반 API 서버 (AWS EC2 Docker 환경)
- GitHub Pages를 통한 정적 프론트엔드 호스팅
- Cloudflare Quick Tunnel을 이용해 FastAPI를 외부에 안전하게 노출
- GitHub Pages에서 FastAPI API 호출하여 데이터 전달

## 2. 아키텍처 및 구성 요소
- AWS EC2 인스턴스에 Docker로 FastAPI 서비스 및 Cloudflare Tunnel 실행
- FastAPI: Docker 컨테이너로 8000 포트 오픈
- Cloudflare cloudflared: Quick Tunnel 모드로 FastAPI API 노출
- GitHub Pages: 정적 페이지 배포, API 호출은 Quick Tunnel 주소 사용

## 3. 배포 환경
- AWS EC2 (Amazon Linux 2)
- Docker 및 Docker Compose 사용
- Cloudflare 계정 및 Quick Tunnel 설정 완료



## 4. 유투브채널
노랑홍당무
