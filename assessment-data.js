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
    QUESTIONS: {
        general: [
            { id: 'web', field: 'frontend', text: '웹 화면에 버튼이나 애니메이션을 추가하는 일이 흥미롭다.' },
            { id: 'web-detail', field: 'frontend', text: '여러 화면 크기에서 사용하기 편한 웹 인터페이스를 만들고 싶다.' },
            { id: 'data-model', field: 'backend', text: '정보를 어떤 구조로 저장하고 주고받을지 생각하는 것이 즐겁다.' },
            { id: 'rules', field: 'backend', text: '복잡한 서비스 규칙을 정확한 코드로 정리하는 일을 해보고 싶다.' },
            { id: 'patterns', field: 'ai', text: '많은 데이터에서 의미 있는 패턴을 찾아보는 일이 궁금하다.' },
            { id: 'experiments', field: 'ai', text: '실험 결과를 수치와 그래프로 비교하며 개선하는 것이 좋다.' },
            { id: 'device', field: 'mobile', text: '카메라나 위치처럼 휴대전화 기능을 활용하는 앱을 만들고 싶다.' },
            { id: 'mobile-flow', field: 'mobile', text: '손안에서 매끄럽게 작동하는 앱의 화면 흐름에 관심이 있다.' },
            { id: 'automation', field: 'devops', text: '반복하는 설치나 배포 작업을 자동화하고 싶다.' },
            { id: 'reliability', field: 'devops', text: '서비스가 멈췄을 때 원인을 추적하고 복구하는 일이 흥미롭다.' },
            { id: 'user', field: 'design', text: '사용자가 어디서 어려움을 겪는지 관찰하고 개선하고 싶다.' },
            { id: 'layout', field: 'design', text: '정보의 순서와 시각적 배치를 바꾸며 전달력을 높이는 것이 좋다.' },
        ],
    },
};

if (typeof module === 'object') module.exports = typeMData;
else globalThis.TypeM = typeMData;
