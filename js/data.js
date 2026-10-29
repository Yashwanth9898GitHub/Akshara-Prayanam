/* Akshara Prayanam — store configuration and local book catalogue.
   Edit this file to update books, prices and contact details. */
window.AP = window.AP || {};

AP.config = {
  storeName: 'Akshara Prayanam',
  // International format, digits only (country code + number). REPLACE before going live.
  whatsappNumber: '919848085505',
  whatsappDisplay: '+91 9848085505',
  currency: '₹'
};

AP.languages = [
  { id: 'telugu', name: 'Telugu', native: 'తెలుగు', lang: 'te' },
  { id: 'english', name: 'English', native: 'English', lang: 'en' },
  { id: 'hindi', name: 'Hindi', native: 'हिन्दी', lang: 'hi' },
  { id: 'tamil', name: 'Tamil', native: 'தமிழ்', lang: 'ta' },
  { id: 'kannada', name: 'Kannada', native: 'ಕನ್ನಡ', lang: 'kn' },
  { id: 'malayalam', name: 'Malayalam', native: 'മലയാളം', lang: 'ml' },
  { id: 'other', name: 'Other Languages', native: 'Other', lang: 'en' }
];

/* Only categories and languages that have at least one book are shown on the site. */
AP.categories = [
  { id: 'emotional', name: 'Emotional Literature', native: 'భావోద్వేగ సాహిత్యం', blurb: 'Stories that touch the heart and stay with you.' },
  { id: 'fiction', name: 'Fiction', blurb: 'Novels and plays that open whole worlds.' },
  { id: 'romance', name: 'Romance', blurb: 'Love stories, timeless and tender.' },
  { id: 'self-help', name: 'Self-Help', blurb: 'Gentle guides for a better day.' },
  { id: 'motivation', name: 'Motivation', blurb: 'Words that lift and move you forward.' },
  { id: 'poetry', name: 'Poetry', blurb: 'Verse, song and the music of language.' },
  { id: 'education', name: 'Education', blurb: 'Learning that lasts a lifetime.' },
  { id: 'technology', name: 'Technology', blurb: 'Ideas that built the modern machine.' },
  { id: 'business', name: 'Business', blurb: 'Enterprise, strategy and economics.' },
  { id: 'philosophy', name: 'Philosophy', blurb: 'Questions worth a lifetime of thought.' },
  { id: 'spirituality', name: 'Spirituality', blurb: 'Devotion, stillness and the inner path.' },
  { id: 'biography', name: 'Biography', blurb: 'Lives told in their own words.' },
  { id: 'children', name: "Children's Books", blurb: 'Fables and wonders for young readers.' },
  { id: 'mystery', name: 'Mystery and Thriller', blurb: 'Clues, secrets and sleepless nights.' }
];

/* Book fields:
   - coverImage (2:3) + optional coverImageSmall (480px wide) for cards and thumbnails
   - description: array of paragraphs; quote: array of lines; sample: optional short excerpt
   - cover: colours used when no coverImage is provided */
AP.books = [
  {
    id: 'amma-cheera-kongu-katha',
    title: 'Amma Cheera Kongu Katha',
    titleNative: 'అమ్మ చీర కొంగు కథ',
    author: 'యశ్వంత్',
    language: 'telugu',
    categories: ['emotional'],
    format: 'Digital PDF eBook',
    price: 89,
    featured: true,
    dedication: 'అమ్మకు ప్రేమతో అంకితం',
    coverImage: 'assets/covers/amma-cheera-kongu-cover.jpg',
    coverImageSmall: 'assets/covers/amma-cheera-kongu-cover-480.jpg',
    coverAlt: 'Cover of అమ్మ చీర కొంగు కథ by యశ్వంత్: a mother in a cream saree with a red border walks along a village path at sunrise, her little son holding the end of her saree.',
    cover: { bg: '#7A2E2E', ink: '#FAF7F0', accent: '#C49A52' },
    short: 'ఇది ఒక అమ్మ ప్రేమ కథ. ఒక బిడ్డ బాల్యం కథ. మనందరి హృదయాల్లో దాగి ఉన్న జ్ఞాపకాల కథ.',
    description: [
      'చిన్నప్పుడు భయమేస్తే అమ్మ కొంగు పట్టుకునేవాళ్లం. ఆకలేస్తే అమ్మ చేతి ముద్ద కోసం ఎదురుచూసేవాళ్లం. కన్నీళ్లు వస్తే అమ్మ చీర కొంగుతో తుడుచుకునేవాళ్లం.',
      'ఆ రోజుల్లో ఆ చిన్న కొంగు మనకు ఒక సాధారణమైన వస్త్రంలా కనిపించి ఉండవచ్చు. కానీ దాని వెనుక దాగి ఉన్న ప్రేమ, త్యాగం, భద్రత, ఆప్యాయత విలువ మనకు పెరిగి పెద్దయ్యాకే అర్థమవుతుంది.',
      '‘అమ్మ చీర కొంగు కథ’ మనందరి బాల్యంలో ఎక్కడో ఒకచోట దాచుకున్న అలాంటి జ్ఞాపకాల ప్రయాణం.',
      'అమ్మ మన కోసం చేసిన చిన్న చిన్న త్యాగాలు, మన కన్నీళ్లను తుడిచిన ఆ చేతులు, మనకు ధైర్యం చెప్పిన ఆ మాటలు, మన విజయాల వెనుక ఆమె కన్న కలలు — ఇవన్నీ మనసును తాకే భావాలుగా ఈ పుస్తకంలో చోటు చేసుకున్నాయి.',
      'జీవితంలో ఎంత ఎత్తుకు ఎదిగినా, ఎంత దూరం వెళ్లినా, అమ్మ దగ్గర కూర్చున్నప్పుడు మనసు మళ్లీ చిన్నపిల్లలా మారుతుంది.',
      'ఇది కేవలం ఒక పుస్తకం కాదు.',
      'ఇది ఒక అమ్మ ప్రేమ కథ.\nఒక బిడ్డ బాల్యం కథ.\nమనందరి హృదయాల్లో దాగి ఉన్న జ్ఞాపకాల కథ.',
      'అమ్మ ఉన్నప్పుడే ఆమె ప్రేమను ఆస్వాదించండి. ఆమెకు సమయం ఇవ్వండి. ఆమె చేతిని పట్టుకుని కాసేపు మాట్లాడండి.',
      'ఎందుకంటే అమ్మ ప్రేమకు ప్రత్యామ్నాయం లేదు!'
    ],
    quote: [
      'అమ్మ చీర కొంగు...',
      'అది కేవలం చీర చివర కాదు...',
      'మన చిన్ననాటి కన్నీళ్లను తుడిచిన ఓదార్పు...',
      'మన భయాలను దాచుకున్న ఓ ఆశ్రయం...',
      'మన జీవితానికి ధైర్యం నేర్పిన ఓ బంధం!'
    ]
  },
  {
    id: 'still-breathing-book-one',
    title: 'Still Breathing: Book One',
    subtitle: 'A Story Etched in Love, Sacrifice, and Memories',
    author: 'Yashwanth',
    language: 'english',
    categories: ['biography', 'emotional'],
    format: 'Digital PDF eBook',
    price: 89,
    featured: false,
    coverImage: 'assets/covers/still-breathing-book-one-1000.jpg',
    coverImageSmall: 'assets/covers/still-breathing-book-one-480.jpg',
    coverAlt: 'Still Breathing: Book One cover, with the title in cream and gold above a silhouetted figure against a deep teal and amber background.',
    cover: { bg: '#153F3A', ink: '#FAF7F0', accent: '#E8A32A' },
    short: 'A coming-of-age journey through family love, grief, setbacks, and the courage to begin again.',
    description: [
      'Still Breathing: Book One is a first-person coming-of-age story shaped by family, sacrifice, and the memories that stay with us. It follows a boy from childhood in a village through school, friendships, and the challenges of growing up.',
      'The journey moves through the loss of a beloved grandmother, a sister’s protective bond, difficult school years, hostel life, and setbacks that threaten to interrupt his education. Along the way, kindness, friendship, and his mother’s steady support help him find the strength to continue.',
      'As he faces a frightening accident, the disruption of the pandemic, and choices about his future, the story reflects on resilience and the quiet decision to try again. Book One closes at a new crossroads, with the journey continuing in Book Two.'
    ]
  }
];
