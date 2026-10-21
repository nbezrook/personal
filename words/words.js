// Curated vocabulary; transliterations are reading aids, not phonetic notation.
const rows = [
// English | Farsi | reading aid | Russian | reading aid
`hello|سلام|salâm|привет|privet
goodbye|خداحافظ|khodâhâfez|пока|poka
thank you|ممنون|mamnun|спасибо|spasibo
yes|بله|bale|да|da
no|نه|na|нет|net
water|آب|âb|вода|voda
bread|نان|nân|хлеб|khleb
tea|چای|chây|чай|chay
milk|شیر|shir|молоко|moloko
apple|سیب|sib|яблоко|yabloko
house|خانه|khâne|дом|dom
book|کتاب|ketâb|книга|kniga
pen|خودکار|khodkâr|ручка|ruchka
table|میز|miz|стол|stol
chair|صندلی|sandali|стул|stul
door|در|dar|дверь|dver
window|پنجره|panjere|окно|okno
sun|خورشید|khorshid|солнце|solntse
moon|ماه|mâh|луна|luna
star|ستاره|setâre|звезда|zvezda
mother|مادر|mâdar|мать|mat
father|پدر|pedar|отец|otets
friend|دوست|dust|друг|drug
cat|گربه|gorbe|кошка|koshka
dog|سگ|sag|собака|sobaka
day|روز|ruz|день|den
night|شب|shab|ночь|noch
big|بزرگ|bozorg|большой|bolshoy
small|کوچک|kuchak|маленький|malenkiy
beautiful|زیبا|zibâ|красивый|krasivyy`,
`city|شهر|shahr|город|gorod
street|خیابان|khiyâbân|улица|ulitsa
store|فروشگاه|forushgâh|магазин|magazin
market|بازار|bâzâr|рынок|rynok
school|مدرسه|madrese|школа|shkola
university|دانشگاه|dâneshgâh|университет|universitet
hospital|بیمارستان|bimârestân|больница|bolnitsa
airport|فرودگاه|forudgâh|аэропорт|aeroport
train|قطار|qatâr|поезд|poezd
airplane|هواپیما|havâpeymâ|самолёт|samolyot
ticket|بلیط|belit|билет|bilet
journey|سفر|safar|путешествие|puteshestviye
breakfast|صبحانه|sobhâne|завтрак|zavtrak
lunch|ناهار|nâhâr|обед|obed
dinner|شام|shâm|ужин|uzhin
vegetable|سبزی|sabzi|овощ|ovoshch
fruit|میوه|mive|фрукт|frukt
weather|آب و هوا|âb o havâ|погода|pogoda
rain|باران|bârân|дождь|dozhd
snow|برف|barf|снег|sneg
wind|باد|bâd|ветер|veter
spring|بهار|bahâr|весна|vesna
summer|تابستان|tâbestân|лето|leto
autumn|پاییز|pâyiz|осень|osen
winter|زمستان|zemestân|зима|zima
happy|خوشحال|khoshhâl|счастливый|schastlivyy
tired|خسته|khaste|усталый|ustalyy
hungry|گرسنه|gorosne|голодный|golodnyy
thirsty|تشنه|teshne|испытывающий жажду|ispytyvayushchiy zhazhdu
busy|مشغول|mashghul|занятый|zanyatyy`,
`opportunity|فرصت|forsat|возможность|vozmozhnost
responsibility|مسئولیت|masuliyat|ответственность|otvetstvennost
experience|تجربه|tajrobe|опыт|opyt
knowledge|دانش|dânesh|знание|znaniye
research|پژوهش|pazhuhesh|исследование|issledovaniye
decision|تصمیم|tasmim|решение|resheniye
success|موفقیت|movafaqiyat|успех|uspekh
failure|شکست|shekast|неудача|neudacha
progress|پیشرفت|pishraft|прогресс|progress
development|توسعه|tose'e|развитие|razvitiye
environment|محیط زیست|mohit-e zist|окружающая среда|okruzhayushchaya sreda
society|جامعه|jâme'e|общество|obshchestvo
culture|فرهنگ|farhang|культура|kultura
tradition|سنت|sonnat|традиция|traditsiya
freedom|آزادی|âzâdi|свобода|svoboda
justice|عدالت|edâlat|справедливость|spravedlivost
equality|برابری|barâbari|равенство|ravenstvo
confidence|اعتماد به نفس|etemâd be nafs|уверенность в себе|uverennost v sebe
patience|صبر|sabr|терпение|terpeniye
curiosity|کنجکاوی|konjkâvi|любопытство|lyubopytstvo
imagination|تخیل|takhayol|воображение|voobrazheniye
creativity|خلاقیت|khalâqiyat|творчество|tvorchestvo
cooperation|همکاری|hamkâri|сотрудничество|sotrudnichestvo
competition|رقابت|reqâbat|конкуренция|konkurentsiya
challenge|چالش|châlesh|вызов|vyzov
solution|راه حل|râh-e hal|способ решения|sposob resheniya
consequence|پیامد|payâmad|последствие|posledstviye
purpose|هدف|hadaf|цель|tsel
evidence|شواهد|shavâhed|свидетельства|svidetelstva
perspective|دیدگاه|didgâh|точка зрения|tochka zreniya`
];
export const WORDS = { fa: [], ru: [] };
rows.forEach((block, level) => block.split('\n').forEach((row, i) => {
 const [meaning,fa,ft,ru,rt]=row.split('|');
 WORDS.fa.push({id:`fa-${level}-${i}`,word:fa,reading:ft,meaning,level});
 WORDS.ru.push({id:`ru-${level}-${i}`,word:ru,reading:rt,meaning,level});
}));
