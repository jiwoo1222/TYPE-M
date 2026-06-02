const typeMData = {
    TRACKS: {
        general: {
            title: '일반 전공 검사',
            fields: [
                { id: 'frontend', name: '프론트엔드', description: '사용자가 직접 만나는 웹 화면과 상호작용을 만듭니다.', next: 'HTML·CSS로 자기소개 페이지를 만들고 버튼 동작을 추가해보세요.' },
                { id: 'backend', name: '백엔드', description: '서비스의 데이터와 업무 규칙을 설계하고 구현합니다.', next: '간단한 할 일 API를 만들고 데이터 저장과 입력 검증을 연습해보세요.' },
                { id: 'ai', name: 'AI·데이터', description: '데이터에서 패턴을 찾고 예측이나 분류를 실험합니다.', next: '공개 데이터로 표와 그래프를 만들고 간단한 분류 모델을 비교해보세요.' },
                { id: 'mobile', name: '모바일 앱', description: '휴대기기의 기능을 활용하는 앱을 만듭니다.', next: '메모 앱을 만들고 화면 전환과 기기 내 저장을 구현해보세요.' },
                { id: 'devops', name: '데브옵스', description: '서비스 배포와 운영을 자동화하고 안정성을 높입니다.', next: '작은 웹 서비스를 배포하고 빌드 자동화와 로그 확인을 연습해보세요.' },
                { id: 'design', name: '디자인', description: '사용자의 문제를 이해하고 읽기 쉬운 화면과 흐름을 설계합니다.', next: '자주 쓰는 앱의 불편한 화면을 고르고 개선 시안을 만들어보세요.' },
            ],
        },
        skills: {
            title: '기능반 검사',
            fields: [
                { id: 'security', name: '사이버보안', description: '시스템의 취약점을 이해하고 위협을 분석·방어합니다.', next: '허가된 실습 환경에서 네트워크 기초와 보안 로그 분석을 연습해보세요.' },
                { id: 'robotics', name: '모바일로보틱스', description: '센서와 제어 코드를 연결해 로봇의 동작을 설계합니다.', next: '시뮬레이터에서 센서 입력으로 이동 방향을 바꾸는 제어를 구현해보세요.' },
                { id: 'network', name: 'IT네트워크시스템', description: '장비와 통신 경로를 구성하고 연결 문제를 해결합니다.', next: '네트워크 시뮬레이터로 작은 망을 만들고 연결 상태를 점검해보세요.' },
                { id: 'app', name: '모바일앱개발', description: '제한된 시간 안에 요구사항을 작동하는 앱으로 구현합니다.', next: '목록·상세·저장이 있는 작은 앱을 만들고 완성 시간을 기록해보세요.' },
                { id: 'cloud', name: '클라우드컴퓨팅', description: '클라우드 자원을 구성하고 서비스 운영을 자동화합니다.', next: '로컬 컨테이너로 웹 서버를 실행하고 구성 파일로 환경을 재현해보세요.' },
            ],
        },
    },
};

if (typeof module === 'object') module.exports = typeMData;
else globalThis.TypeM = typeMData;
