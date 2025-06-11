# 서비스 구성 및 배포 안내
### 각종 로그인 인증이 없는 서비스입니다
### 현재는 무료로 사용가능하며, 접속과부하시 서버를 닫을수도 있습니다
### 내부서버동작은 비공개입니다( Data Flow 이미지로 확인하세요 )
### 연락 : 유투브 '노랑홍당무'
## 서비스 동작구조도 

![image](https://github.com/user-attachments/assets/83067bdd-3690-4647-a7ed-2810a6ba7b28)


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

