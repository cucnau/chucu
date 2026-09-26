// Danh sách toàn bộ các Tag Thể Loại chính thức trên Tấn Giang do người dùng cung cấp kèm link trực tiếp

export interface CoreTagConfig {
  id: string;             // Khóa định danh
  zh: string;             // Tag tiếng Trung gốc trên Tấn Giang
  aliases?: string[];     // Các tag đồng nghĩa
  nameVi: string;         // Tên dịch tiếng Việt
  category: 'genre' | 'setting' | 'trope' | 'relationship';
  bq?: string;            // Mã ID bq trên Tấn Giang
  jjwxcUrl: string;       // Link trực tiếp đến BXH tag trên Tấn Giang
  badgeColor?: string;
}

export const TAG_CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả tag' },
  { id: 'genre', label: 'Thể loại & Cơ chế' },
  { id: 'setting', label: 'Bối cảnh thế giới' },
  { id: 'trope', label: 'Thiết lập đặc biệt' },
  { id: 'relationship', label: 'Tình cảm & Cảm xúc' },
] as const;

export const CORE_JJWXC_TAGS: CoreTagConfig[] = [
  {
    "id": "wuxianliu",
    "zh": "无限流",
    "nameVi": "Vô hạn lưu",
    "bq": "83",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=83&removebq=&searchkeywords=&sign=ti2u5ipa7e6258163f7cd86d1d533ad1ab3aabe2&time=1790422583778&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "lingyi",
    "zh": "灵异神怪",
    "nameVi": "Siêu nhiên",
    "bq": "26",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=26&removebq=&searchkeywords=&sign=2qafmw6p19267048332a8695c219abf45601d771&time=1790422614390&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "chuanshu",
    "zh": "穿书",
    "nameVi": "Xuyên sách",
    "bq": "134",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=134&removebq=&searchkeywords=&sign=zt3peo6oc075590792bb5405407b48e92c7f0b68&time=1790422646953&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "chongsheng",
    "zh": "重生",
    "nameVi": "Sống lại",
    "bq": "75",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=75&removebq=&searchkeywords=&sign=c3mpczlab3b710c87c622d4a6778adb207de45a9&time=1790422674026&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "kuaichuan",
    "zh": "快穿",
    "nameVi": "Xuyên nhanh",
    "bq": "125",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=125&removebq=&searchkeywords=&sign=sfbupih8eba92d515fea6ae538efe825a057ea20&time=1790422693548&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "chuanyue",
    "zh": "穿越时空",
    "nameVi": "Xuyên không",
    "bq": "60",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=60&removebq=&searchkeywords=&sign=2mrmqxog5161b7f1c757b05bf4d0a943dad22baa&time=1790422710516&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "xitong",
    "zh": "系统",
    "nameVi": "Hệ thống",
    "bq": "122",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=122&removebq=&searchkeywords=&sign=1wi5nxpa71e82f269827d32f535e5508f852ce4e&time=1790422727251&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "xianxia",
    "zh": "仙侠修真",
    "nameVi": "Tiên hiệp tu chân",
    "bq": "68",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=68&removebq=&searchkeywords=&sign=1pzeu3e1535687bf6c88c7fc9e846e9276e7af1c&time=1790422748116&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "esport",
    "zh": "电竞",
    "nameVi": "Esport",
    "bq": "328",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=328&removebq=&searchkeywords=&sign=arpwja5b2e00e3241c74e51565fdd34886ee4aa6&time=1790422782329&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "gameonline",
    "zh": "游戏网游",
    "nameVi": "Game online",
    "bq": "92",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=92&removebq=&searchkeywords=&sign=9v7gw8gy414568cf32cca5134826fe209a2aa872&time=1790422807208&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "zhongtian",
    "zh": "种田文",
    "nameVi": "Làm ruộng",
    "bq": "66",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=66&removebq=&searchkeywords=&sign=doefjdku8a61b617cf4cf5f9c2812a877eb96253&time=1790422828669&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "shangzhan",
    "zh": "商战",
    "nameVi": "Thương chiến",
    "bq": "123",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=123&removebq=&searchkeywords=&sign=jxv9dysz1978c6b6a23373985ff7f7ce1315dc3c&time=1790422843195&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "xihuan",
    "zh": "西幻",
    "nameVi": "Fantasy phương Tây",
    "bq": "143",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=143&removebq=&searchkeywords=&sign=agoh50i5b6f8b62a089d0bccb27a84107b200675&time=1790422868375&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "shengjiliu",
    "zh": "升级流",
    "nameVi": "Hành trình thăng cấp",
    "bq": "139",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=139&removebq=&searchkeywords=&sign=h2r4rc0qe2392898b4cecbb333803e4b36a7a709&time=1790422886219&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "kesulu",
    "zh": "克苏鲁",
    "nameVi": "Cthulhu",
    "bq": "283",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=283&removebq=&searchkeywords=&sign=3kq075u2a22d6b49618a99d8dee5c629d2fbb2c1&time=1790422909241&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "jingsong",
    "zh": "惊悚",
    "nameVi": "Kinh hoàng",
    "bq": "lx9",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx9=9&collectiontypes=ors&notlikecollectiontypes=ands&bq=&removebq=&searchkeywords=&sign=moexa91d3292cec1772775ff6ebafcf96970d4e0&time=1790422931730&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "xiaoyuan",
    "zh": "校园",
    "nameVi": "Học đường",
    "bq": "185",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=185&removebq=&searchkeywords=&sign=oi25bzsyfa98d2612bbb1700f13b9cb57de62f8e&time=1790422960381&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "gongting",
    "zh": "宫廷侯爵",
    "nameVi": "Cung đình hầu tước",
    "bq": "32",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=32&removebq=&searchkeywords=&sign=itjrdy848d373d8b1797c20839a103d9bbcf5e12&time=1790422979714&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "dushi",
    "zh": "都市",
    "nameVi": "Đô thị",
    "bq": "30",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=30&removebq=&searchkeywords=&sign=46ki59v795172cefe8a5b5daebd89f774e0ca115&time=1790423000810&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "xingji",
    "zh": "星际",
    "nameVi": "Vũ trụ",
    "bq": "135",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=135&removebq=&searchkeywords=&sign=xsmrj47m3d96b50746e26b820f31009660b659f4&time=1790423018463&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "yulequan",
    "zh": "娱乐圈",
    "nameVi": "Showbiz",
    "bq": "64",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=64&removebq=&searchkeywords=&sign=0xcsdjad7705ca23e00311df87b8c646ece4ca9a&time=1790423037694&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "moxishi",
    "zh": "末世",
    "nameVi": "Tận thế",
    "bq": "81",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=81&removebq=&searchkeywords=&sign=ngygzgw74577a007d7b3c5bdd107fefd39d928aa&time=1790423053328&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "minguo",
    "zh": "民国",
    "nameVi": "Dân quốc",
    "bq": "61",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=61&removebq=&searchkeywords=&sign=ii4vfxtcac080088391d943d2562065a253eb964&time=1790423072068&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "abo",
    "zh": "ABO",
    "nameVi": "ABO",
    "bq": "259",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=259&removebq=&searchkeywords=&sign=iufb0fw34b8ff12799cd73cbf31a8f4c1b4eebaa&time=1790423091002&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "shengzi",
    "zh": "生子",
    "nameVi": "Sinh con",
    "bq": "20",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=20&removebq=&searchkeywords=&sign=bfd24sujc38134da0e1a32adfea27aca44de3abb&time=1790423108949&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "haomen",
    "zh": "豪门世家",
    "nameVi": "Danh gia vọng tộc",
    "bq": "33",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=33&removebq=&searchkeywords=&sign=mtx37d1gd87fe503614633f6626a6cbaf6ef290b&time=1790423131819&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "wanrenmi",
    "zh": "万人迷",
    "nameVi": "Vạn người mê",
    "bq": "295",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=295&removebq=&searchkeywords=&sign=qny0pydt5891d889b5d0ad4de63cea0e7d4da298&time=1790423151335&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "jijia",
    "zh": "机甲",
    "nameVi": "Cơ giáp",
    "bq": "97",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=97&removebq=&searchkeywords=&sign=mniek1cfaaabceb839185da5e824e1ba0cf76635&time=1790423166643&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "zhibo",
    "zh": "直播",
    "nameVi": "Livestream",
    "bq": "142",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=142&removebq=&searchkeywords=&sign=ec6181dq61adadbc532aca830b1cd6b68fa46c86&time=1790423185219&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "qiangqiang",
    "zh": "强强",
    "nameVi": "Cường cường",
    "bq": "19",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=19&removebq=&searchkeywords=&sign=9pzt0wt076da1c44307eb9b412ce3b1f4c3579aa&time=1790423201880&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "qingyou",
    "zh": "情有独钟",
    "nameVi": "Tình yêu duy nhất",
    "bq": "39",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=39&removebq=&searchkeywords=&sign=1b2j4m1cc148280a1abdee71e0bb6d056fecbe46&time=1790423224552&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "tianwen",
    "zh": "甜文",
    "nameVi": "Truyện ngọt",
    "bq": "124",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=124&removebq=&searchkeywords=&sign=m19y72o653a7f7c99e60c8d9e190709517fd8818&time=1790423243234&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "shuangwen",
    "zh": "爽文",
    "nameVi": "Truyện sướng",
    "bq": "137",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=137&removebq=&searchkeywords=&sign=solbv7v489da6db2d28f63c82bfdd57876ac7e55&time=1790423262643&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "tianzuo",
    "zh": "天作之合",
    "nameVi": "Trời sinh một cặp",
    "bq": "52",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=52&removebq=&searchkeywords=&sign=4go5ad1b2a95e83d28039b0f5ba01291272edb7f&time=1790423281009&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "shadiao",
    "zh": "沙雕",
    "nameVi": "Hài hước",
    "bq": "266",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=266&removebq=&searchkeywords=&sign=a0ah8nqxac3be12ddc12b5f9b0fa462cd760dbff&time=1790423297414&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "pojing",
    "zh": "破镜重圆",
    "nameVi": "Gương vỡ lại lành",
    "bq": "47",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=47&removebq=&searchkeywords=&sign=9509d3br2a8f6c5bc4dd8e0d14b625f87fdc22ae&time=1790423331509&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "huanxi",
    "zh": "欢喜冤家",
    "nameVi": "Hoan hỉ oan gia",
    "bq": "41",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=41&removebq=&searchkeywords=&sign=xba0z4xx89bb8154eeaafaafe482afba072b8301&time=1790423346796&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "xianhun",
    "zh": "先婚后爱",
    "nameVi": "Cưới trước yêu sau",
    "bq": "315",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=315&removebq=&searchkeywords=&sign=97ueabejf4a89b0d1a847f050e646ed9fb6a48b0&time=1790423363569&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "zhuma",
    "zh": "青梅竹马",
    "nameVi": "Thanh mai trúc mã",
    "bq": "62",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=62&removebq=&searchkeywords=&sign=48o7061ke61fa1ee7d7de9d3d1904981188a05d5&time=1790423379770&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "shaoxiang",
    "zh": "哨向",
    "nameVi": "Lính gác dẫn đường",
    "bq": "369",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=369&removebq=259&searchkeywords=&sign=abvsj3q873957f918a7b69ed2521b4a7c1c8e762&time=1790423473759&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "saibopengke",
    "zh": "赛博朋克",
    "nameVi": "Cyberpunk",
    "bq": "277",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=277&removebq=&searchkeywords=&sign=k1i07msl598abaec7d8efc2e7d5c768990ee91db&time=1790423516691&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "zhengqipengke",
    "zh": "蒸汽朋克",
    "nameVi": "Steampunk",
    "bq": "278",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=278&removebq=&searchkeywords=&sign=w9nj4o02e228198cacab104fd2e737b503be379e&time=1790423546085&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "xiangxiangxiangsha",
    "zh": "相爱相杀",
    "nameVi": "Yêu nhau lắm cắn nhau đau",
    "bq": "103",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=103&removebq=&searchkeywords=&sign=1i2fjxvl2f7d2e74773412ea8a3adae72ad8ffc0&time=1790423687363&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "meiqiangcan",
    "zh": "美强惨",
    "nameVi": "Đẹp mạnh khổ",
    "bq": "291",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=291&removebq=&searchkeywords=&sign=nr0hzxpe01b040f5b29361db470d9f81bc767e65&time=1790423811968&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "shitu",
    "zh": "师徒",
    "nameVi": "Sư đồ",
    "bq": "292",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=292&removebq=&searchkeywords=&sign=96x8bpwjb9fb326e2c9238bc722e600acbc2af2a&time=1790423833830&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "xuanyituili",
    "zh": "悬疑推理",
    "nameVi": "Trinh thám huyền bí",
    "bq": "128",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=128&removebq=&searchkeywords=&sign=pjhyhxdg994f556d11aba148bb43aff1213f504d&time=1790423937086&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "jinshuiloutai",
    "zh": "近水楼台",
    "nameVi": "Lửa gần rơm lâu ngày cũng bén",
    "bq": "46",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=46&removebq=&searchkeywords=&sign=s0rhcbfqb514fed5fdeed353bb8e1982e1e53437&time=1790423970280&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "fuchouniezha",
    "zh": "复仇虐渣",
    "nameVi": "Báo thù người xấu",
    "bq": "145",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=145&removebq=&searchkeywords=&sign=nkgqr4rr7f5e449ba29b09feb1f33326abbb0f1c&time=1790423996719&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "lianaiheyue",
    "zh": "恋爱合约",
    "nameVi": "Hợp đồng tình yêu",
    "bq": "48",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=48&removebq=&searchkeywords=&sign=c1isqpz3571b8691aa5514832a1bd78feb71f0db&time=1790424016835&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "yishidalu",
    "zh": "异世大陆",
    "nameVi": "Thế giới khác",
    "bq": "57",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=57&removebq=&searchkeywords=&sign=ulf0xwav23bd1dcd530cb7a96757337a56277050&time=1790424092726&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "feitu",
    "zh": "废土",
    "nameVi": "Đất hoang",
    "bq": "281",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=281&removebq=&searchkeywords=&sign=qlfvd92948624e00c6492c1912e2b3ff93b791b6&time=1790424174778&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "disitianzai",
    "zh": "第四天灾",
    "nameVi": "Thiên tai thứ tư",
    "bq": "285",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=285&removebq=&searchkeywords=&sign=6bxs4bwia5a8705dccdf772f55e8feece18dabd7&time=1790424216507&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "xianshi",
    "zh": "现实",
    "nameVi": "Thực tế",
    "bq": "271",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=271&removebq=&searchkeywords=&sign=zg00tuv23f59187d6a1309a3082ba27e5c73bfe2&time=1790424345090&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "guchuanjin",
    "zh": "古穿今",
    "nameVi": "Cổ đại xuyên đến hiện đại",
    "bq": "65",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=65&removebq=&searchkeywords=&sign=x1xoz6h42a6f5b5153046c30f2df2df1be79e5ab&time=1790424396788&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "mengchong",
    "zh": "萌宠",
    "nameVi": "Thú cưng đáng yêu",
    "bq": "205",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=205&removebq=&searchkeywords=&sign=d412qg4bb9dadce2ce2948caf2aca06022c83864&time=1790425231565&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "tiyujingji",
    "zh": "体育竞技",
    "nameVi": "Thi đấu thể thao",
    "bq": "70",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=70&removebq=328&searchkeywords=&sign=a2mthxzmf5c025e47604e23820f3ec0a18b94d30&time=1790425199257&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "gangfeng",
    "zh": "港风",
    "nameVi": "Phong cách Hồng Kông",
    "bq": "282",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=282&removebq=&searchkeywords=&sign=5m9a291mfe44f22d49a0ee1e407fc07a2ac842fc&time=1790425163039&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "dongfangxuanhuan",
    "zh": "东方玄幻",
    "nameVi": "Kỳ ảo phương Đông",
    "bq": "144",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=144&removebq=&searchkeywords=&sign=1entufgsb8ede076120b424f58e23ab90ea40db3&time=1790425145547&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "rijiushengqing",
    "zh": "日久生情",
    "nameVi": "Lâu ngày sinh tình",
    "bq": "332",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=332&removebq=&searchkeywords=&sign=g0zrqq07d18d9466deac6f8e092317237f86c454&time=1790425130460&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "hunlian",
    "zh": "婚恋",
    "nameVi": "Hôn nhân và tình yêu",
    "bq": "78",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=78&removebq=&searchkeywords=&sign=5obg622c9559ae8b060b287ed4300a382fcbbeb7&time=1790425117629&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "choujiangchouka",
    "zh": "抽奖抽卡",
    "nameVi": "Rút thưởng rút thẻ",
    "bq": "339",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=339&removebq=&searchkeywords=&sign=0ee8uhp80970dff24f600987adde174e639c1a0d&time=1790425095190&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "zhifuqingyuan",
    "zh": "制服情缘",
    "nameVi": "Tình yêu đồng phục",
    "bq": "85",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=85&removebq=&searchkeywords=&sign=w3r3yo86a3c9a8eb91948f54a9f7af36f4c8e700&time=1790425071688&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "nuewen",
    "zh": "虐文",
    "nameVi": "Đau đớn",
    "bq": "42",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=42&removebq=&searchkeywords=&sign=19lxjt5b07d8cb50d91270e64a735869f5b812ad&time=1790425057203&jsver=20260522",
    "category": "relationship"
  },
  {
    "id": "chuangye",
    "zh": "创业",
    "nameVi": "Khởi nghiệp",
    "bq": "330",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=330&removebq=&searchkeywords=&sign=3val9hn20c38e379d560e0aa61d9df17bdbab0b7&time=1790425030665&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "qiaozhuanggaiban",
    "zh": "乔装改扮",
    "nameVi": "Cải trang cải dạng",
    "bq": "51",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=51&removebq=&searchkeywords=&sign=dcdj0a0nb54ab43c57caa40500a7924b05cb3e32&time=1790425015165&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "shishangquan",
    "zh": "时尚圈",
    "nameVi": "Giới thời trang",
    "bq": "182",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=182&removebq=&searchkeywords=&sign=ipvv0iif209959fdbad994a6efdf5187fc9eac43&time=1790424997395&jsver=20260522",
    "category": "setting"
  },
  {
    "id": "yiwendaoshuo",
    "zh": "异闻传说",
    "nameVi": "Truyền thuyết kỳ lạ",
    "bq": "196",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=196&removebq=&searchkeywords=&sign=s6sl0moh0d547660309f03f3961875b320de96b2&time=1790425290045&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "zhipianren",
    "zh": "纸片人",
    "nameVi": "Nhân vật 2D",
    "bq": "288",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=288&removebq=&searchkeywords=&sign=gc4qp433987cef43fcd02c88e41a21680e5fcca8&time=1790425321894&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "tishen",
    "zh": "替身",
    "nameVi": "Người thay thế",
    "bq": "286",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=286&removebq=&searchkeywords=&sign=p25nwgtf9b465ec12e6194a11249c80e3e18d3f5&time=1790425342404&jsver=20260522",
    "category": "trope"
  },
  {
    "id": "xuanxue",
    "zh": "玄学",
    "nameVi": "Huyền học",
    "bq": "206",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=206&removebq=&searchkeywords=&sign=ai1hgxolb8770b8f6db02d3d306f1f87d22bd320&time=1790425401383&jsver=20260522",
    "category": "genre"
  },
  {
    "id": "chongzu",
    "zh": "虫族",
    "nameVi": "Trùng tộc",
    "bq": "136",
    "jjwxcUrl": "https://m.jjwxc.net/assort?fw0=0&fbsj0=0&novelbefavoritedcount0=0&yc0=0&xx2=2&mainview0=0&sd0=0&lx0=0&collectiontypes=ors&notlikecollectiontypes=ands&bq=136&removebq=&searchkeywords=&sign=",
    "category": "setting"
  },
  {
    "id": "zhugong",
    "zh": "主攻",
    "nameVi": "Chủ công",
    "bq": "1",
    "jjwxcUrl": "https://m.jjwxc.net/assort?mainview1=1&xx2=2",
    "category": "trope"
  },
  {
    "id": "zhushou",
    "zh": "主受",
    "nameVi": "Chủ thụ",
    "bq": "2",
    "jjwxcUrl": "https://m.jjwxc.net/assort?mainview2=2&xx2=2",
    "category": "trope"
  }
];

export function getCoreTagConfig(tagIdOrZh: string): CoreTagConfig | undefined {
  return CORE_JJWXC_TAGS.find(t => t.id === tagIdOrZh || t.zh === tagIdOrZh);
}

export function getTagDisplayName(zh: string): { zh: string; vi: string } {
  const found = CORE_JJWXC_TAGS.find(t => t.zh === zh);
  if (found) return { zh: found.zh, vi: found.nameVi };
  return { zh, vi: zh };
}
