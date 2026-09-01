/**
 * Simple & Clean Wedding Invitation Configuration
 *
 * 이 파일에서 청첩장의 모든 정보를 수정할 수 있습니다.
 * 이미지를 추가하거나 삭제하면 아래 CONFIG.images의 파일 개수도 함께 수정해 주세요.
 *
 * 이미지 폴더 구조 (파일명 규칙):
 *   images/hero/1.jpg      - 메인 사진 (1장, 필수)
 *   images/gallery/1.jpg, 2.jpg, ... - 갤러리 원본 사진들
 *   images/gallery-thumbs/1.jpg, ... - 갤러리 목록용 썸네일
 *   images/location/1.jpg  - 약도/지도 이미지 (1장)
 *   images/og/1.jpg        - 카카오톡 공유 썸네일 (1장)
 */

const CONFIG = {
  // ── 초대장 열기 ──
  useCurtain: false,  // 초대장 열기 화면 사용 여부 (true: 사용, false: 바로 본문 표시)

  // 이미지 파일 개수와 실제 폴더의 번호를 맞춰 주세요.
  images: {
    galleryCount: 22
  },

  // ── 메인 (히어로) ──
  groom: {
    name: "황승현",
    englishName: "Hwang Seung Hyun",
    father: "황성재",
    mother: "김미정",
    fatherDeceased: false,
    motherDeceased: false
  },

  bride: {
    name: "이지수",
    englishName: "Lee Ji Su",
    father: "이철원",
    mother: "이은정",
    fatherDeceased: false,
    motherDeceased: false
  },

  wedding: {
    date: "2026-10-03",
    time: "18:30",
    venue: "아펠가모 반포",
    address: "서울특별시 서초구 반포대로 235 LL층",
    tel: "",
    mapLinks: {
      kakao: "https://kko.to/YVeHB8K_4H",
      naver: "https://naver.me/5PVaG0Ha"
    },
    naverMap: {
      clientId: "3mwbx83t7z",
      latitude: 37.5006573282024,
      longitude: 127.003239742545,
      zoom: 17
    }
  },

  // ── 인사말 ──
  greeting: {
    title: "소중한 분들을 초대합니다",
    content: "안녕하세요 황승현 이지수 입니다. 감사합니다!"
  },

  // ── 오시는 길 ──
  // (mapLinks는 wedding 객체 내에 포함)

  // ── 마음 전하실 곳 ──
  // 전화번호는 숫자와 하이픈 형식으로 입력해 주세요. 예: "010-1234-5678"
  contacts: {
    groom: [
      { role: "아버지", name: "황성재", phone: "010-9059-1495" },
      { role: "어머니", name: "김미정", phone: "010-4718-4058" }
    ],
    bride: [
      { role: "아버지", name: "이철원", phone: "010-9802-2395" },
      { role: "어머니", name: "이은정", phone: "010-5800-2395" }
    ]
  },

  accounts: {
    groom: [
      { role: "부모님", name: "황성재 김미정", bank: "카카오뱅크", number: "3333-33-0735577" },
      { role: "신랑", name: "황승현", bank: "국민은행", number: "037401-04-068119" }
    ],
    bride: [
      { role: "부모님", name: "이철원 이은정", bank: "카카오뱅크", number: "3333-28-9724660" },
      { role: "신부", name: "이지수", bank: "신한은행", number: "110-289-264490" }
    ]
  },

  // ── 링크 공유 시 나타나는 문구 ──
  meta: {
    title: "황승현 ♥ 이지수 결혼합니다",
    description: "2026년 10월 3일 토요일 오후 6시 30분, 아펠가모 반포"
  }
};
