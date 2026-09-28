"""Indian name lists for the synthetic document generator.

Source: hand-curated list (D10 fallback per SOURCES.md section 6).
All names are common Indian names used for synthetic data generation only.
No real person's data is used.
"""
from __future__ import annotations

# 300+ first names (Hindi/common Indian given names with English transliteration)
FIRST_NAMES_HI = [
    "राम", "श्याम", "मोहन", "सोहन", "राजेश", "विजय", "सुरेश", "महेश",
    "अजय", "अमित", "रवि", "संजय", "दिनेश", "रमेश", "नरेश", "उमेश",
    "हरीश", "गणेश", "विनेश", "कमलेश", "सतीश", "मनीष", "आशीष", "जगदीश",
    "बृजेश", "सुभाष", "रमेश", "प्रकाश", "विकास", "आकाश", "कैलाश", "सुमेश",
    "शिवराम", "सीताराम", "रामदास", "शिवदास", "रामप्रसाद", "देवीदास", "रामनाथ",
    "शिवनाथ", "रामलाल", "मोहनलाल", "मुन्नालाल", "छोटेलाल", "बड़ेलाल",
    "प्रेमलाल", "हरीलाल", "गोपाललाल", "रामजी", "लक्ष्मण", "भरत", "शत्रुघ्न",
    "अर्जुन", "भीम", "युधिष्ठिर", "नकुल", "सहदेव", "कृष्ण", "बलराम",
    "जनार्दन", "केशव", "माधव", "गोविंद", "नंदलाल", "बांकेलाल", "मुरारी",
    "कन्हैया", "बिहारी", "गिरधारी", "मुरलीधर", "गोपाल", "श्रीकांत",
    "सुंदरलाल", "रूपलाल", "भोलेनाथ", "महादेव", "शंकर", "त्रिभुवन",
    "चंद्रभान", "सूर्यभान", "ताराचंद", "जवाहरलाल", "राजकुमार", "राजनाथ",
    "देवनाथ", "जगन्नाथ", "परमानंद", "सत्यनारायण", "गोपीनाथ", "बैजनाथ",
    "बालकृष्ण", "सुखलाल", "दुखहरण", "चैनसुख", "परमेश्वरी", "रामप्रीत",
    "शिवप्रसाद", "विश्वनाथ", "बद्रीनाथ", "केदारनाथ", "ओमप्रकाश", "दयाराम",
    "दयाशंकर", "प्रयागराम", "काशीराम", "अयोध्याराम", "तुलसीराम", "सुखराम",
    "भागीरथ", "रघुनाथ", "राघव", "ललितकिशोर", "ललितमोहन", "जयशंकर",
    "कपिलदेव", "हनुमान", "परशुराम", "रामकेवल", "सीताराम", "श्रीराम",
    "मनमोहन", "कल्याण", "कल्याणसिंह", "अखिलेश", "सत्येंद्र", "वीरेंद्र",
    "धर्मेंद्र", "चंद्रशेखर", "रमाशंकर", "नंदकिशोर", "हरिप्रसाद",
    "बालमुकुंद", "जगदंबा", "शिवशंकर", "रामकिशोर", "कामता", "सुग्रीव",
    # Female names
    "सीता", "गीता", "रीता", "मीरा", "राधा", "पार्वती", "लक्ष्मी",
    "सरस्वती", "दुर्गा", "काली", "अम्बा", "जानकी", "सावित्री", "सत्यभामा",
    "रुक्मिणी", "कुसुम", "कमला", "सुमन", "पुष्पा", "माला", "मनोरमा",
    "उषा", "सुषमा", "कल्पना", "रमा", "सरला", "शांति", "ममता",
    "प्रभावती", "विद्यावती", "मुन्नी", "सुनीता", "प्रीती", "अंजू",
    "सुनीता", "चंद्रा", "कांता", "बिमला", "शकुंतला", "वंदना",
    "प्रतिभा", "निर्मला", "रेखा", "विमला", "उर्मिला", "चित्रा",
    "अनीता", "स्मिता", "जयंती", "गायत्री", "भारती", "सुभद्रा",
    # More male names
    "सुरजीत", "जसवंत", "अमरनाथ", "चुन्नीलाल", "खेमलाल", "गजाधर",
    "भगवानदास", "परमानंद", "सियाराम", "टेकराम", "मेघराम", "धर्मराज",
    "जालम", "महाबीर", "बजरंगबली", "मुकुंद", "मुरलीमनोहर", "नारायण",
]

FIRST_NAMES_EN = [
    "Ram", "Shyam", "Mohan", "Sohan", "Rajesh", "Vijay", "Suresh", "Mahesh",
    "Ajay", "Amit", "Ravi", "Sanjay", "Dinesh", "Ramesh", "Naresh", "Umesh",
    "Harish", "Ganesh", "Vinesh", "Kamlesh", "Satish", "Manish", "Ashish", "Jagdish",
    "Brijesh", "Subhash", "Prakash", "Vikas", "Akash", "Kailash", "Sumesh",
    "Shivram", "Sitaram", "Ramdas", "Shivdas", "Ramprasad", "Devidaas", "Ramnath",
    "Shivnath", "Ramlal", "Mohanlal", "Munnalal", "Chhotelal", "Badelal",
    "Premlal", "Harilal", "Gopallal", "Ramji", "Laxman", "Bharat", "Shatrughan",
    "Arjun", "Bhim", "Yudhishthir", "Nakul", "Sahdev", "Krishna", "Balram",
    "Janardhan", "Keshav", "Madhav", "Govind", "Nandlal", "Bankelal", "Murari",
    "Kanhaiya", "Bihari", "Girdhari", "Murlidhar", "Gopal", "Shrikant",
    "Sundarlal", "Rooplal", "Bholenath", "Mahadev", "Shankar", "Tribhuvan",
    "Chandrabhaan", "Suryabhan", "Tarachand", "Jawaharlal", "Rajkumar",
    "Devnath", "Jagannath", "Permanand", "Satyanarayan", "Gopinath", "Baijnath",
    "Balkrishna", "Sukhlal", "Chainlal", "Shivprasad", "Vishwanath", "Badrinath",
    "Kedarnath", "Omprakash", "Dayaram", "Dayashankar", "Kasiram", "Tulsidas",
    "Sukh Ram", "Bhagirath", "Raghunath", "Raghav", "Kapildev", "Hanuman",
    "Parshuram", "Ramkewal", "Manmohan", "Kalyan", "Akhilesh", "Satyendra",
    "Virendra", "Dharmendra", "Chandrasekhar", "Ramashankar", "Nandkishor",
    "Hariprasad", "Balmukund", "Shivkumar", "Ramkishor", "Kamta", "Sugriva",
    "Sita", "Geeta", "Rita", "Meera", "Radha", "Parvati", "Lakshmi",
    "Saraswati", "Durga", "Janaki", "Savitri", "Kusum", "Kamla", "Suman",
    "Pushpa", "Mala", "Manorama", "Usha", "Sushma", "Kalpana", "Rama",
    "Sarla", "Shanti", "Mamta", "Prabhavati", "Vidyavati", "Munni", "Sunita",
    "Preeti", "Anju", "Chandra", "Kanta", "Bimla", "Shakuntala", "Vandana",
    "Pratibha", "Nirmala", "Rekha", "Vimla", "Urmila", "Chitra", "Anita",
    "Smita", "Jayanti", "Gayatri", "Bharati", "Subhadra", "Surjeet", "Jaswant",
    "Amarjeet", "Amarnath", "Chunnilal", "Khemlal", "Gajadhar", "Bhagwandas",
    "Siyaram", "Tekram", "Meghram", "Dharmraj", "Mahavir", "Mukund", "Narayan",
]

# 150+ surnames
SURNAMES_HI = [
    "वर्मा", "शर्मा", "सिंह", "गुप्ता", "यादव", "पाण्डेय", "मिश्र", "तिवारी",
    "दुबे", "त्रिपाठी", "चौधरी", "राय", "श्रीवास्तव", "कुमार", "प्रसाद",
    "जायसवाल", "केसरवानी", "मौर्य", "पटेल", "अग्रवाल", "गर्ग", "बंसल",
    "माहेश्वरी", "खण्डेलवाल", "रस्तोगी", "लखेरा", "चतुर्वेदी", "उपाध्याय",
    "साहू", "कुशवाहा", "लोधी", "राजपूत", "ठाकुर", "कुर्मी", "चमार",
    "कश्यप", "निषाद", "मल्लाह", "केवट", "धीवर", "बिंद", "मांझी",
    "हरिजन", "वाल्मीकि", "दोहरे", "बौद्ध", "कोरी", "धानुक", "कोल",
    "शाक्य", "पाल", "भार", "गोंड", "बैगा", "थारू", "मुसहर", "भुइयाँ",
    "तेली", "सोनी", "लुहार", "कुम्हार", "नाई", "धोबी", "मोची", "बढ़ई",
    "मिस्त्री", "राजमिस्त्री", "ढीमर", "जाटव", "प्रजापति", "लोहार",
    "चंद्रा", "खान", "मलिक", "अंसारी", "मोमिन", "पठान", "शेख", "सिद्दीकी",
    "फारूकी", "हाशमी", "नकवी", "रिज़वी", "जैदी", "अली", "अहमद",
    "सैयद", "कुरैशी", "लोधी", "तुर्की", "चौहान", "तोमर", "भाटी",
    "सिसोदिया", "कछवाहा", "राठौड़", "यदुवंशी", "चंदेल", "बुंदेला",
    "बैस", "गहलोत", "परिहार", "भदौरिया", "जादौन", "कटियार", "तेवतिया",
    "हाथरसिया", "एटाहिया", "बदायूँनी", "फर्रुखाबादी", "आज़मगढ़ी",
]

SURNAMES_EN = [
    "Verma", "Sharma", "Singh", "Gupta", "Yadav", "Pandey", "Mishra", "Tiwari",
    "Dubey", "Tripathi", "Chaudhary", "Rai", "Srivastava", "Kumar", "Prasad",
    "Jaiswal", "Kesarwani", "Maurya", "Patel", "Agarwal", "Garg", "Bansal",
    "Maheshwari", "Khandelwal", "Rastogi", "Lakhera", "Chaturvedi", "Upadhyay",
    "Sahu", "Kushwaha", "Lodhi", "Rajput", "Thakur", "Kurmi", "Chamar",
    "Kashyap", "Nishad", "Mallah", "Kevat", "Dhivar", "Bind", "Manjhi",
    "Harijan", "Valmiki", "Dohre", "Shakya", "Pal", "Bhar", "Gond",
    "Teli", "Soni", "Luhar", "Kumhar", "Nai", "Dhobi", "Mochi", "Badhai",
    "Mistri", "Jatav", "Prajapati", "Lohar", "Chandra", "Khan", "Malik",
    "Ansari", "Momin", "Pathan", "Sheikh", "Siddiqui", "Faruqi", "Hashmi",
    "Naqvi", "Rizvi", "Zaidi", "Ali", "Ahmad", "Saiyad", "Qureshi", "Lodhi",
    "Chauhan", "Tomar", "Bhati", "Sisodia", "Kachhawaha", "Rathore",
    "Chandel", "Bundela", "Bais", "Gehlot", "Parihar", "Bhadauria",
    "Jadon", "Katiyar", "Tevatia",
]

# Village names (for synthetic linked set + general use)
VILLAGE_NAMES_HI = [
    "रामपुर", "शिवपुर", "नारायणपुर", "गोपालपुर", "कृष्णापुर",
    "हरिपुर", "गणेशपुर", "लक्ष्मीपुर", "सरस्वतीपुर", "दुर्गापुर",
    "सीतापुर", "राधापुर", "कमलापुर", "पुष्पापुर", "कुसुमपुर",
    "मोहनपुर", "सोहनपुर", "राजपुर", "विजयपुर", "अमरपुर",
    "बड़ागाँव", "छोटागाँव", "नई बस्ती", "पुराना कस्बा", "मझगाँव",
    "सुखपुर", "आनंदपुर", "भरोसापुर", "उम्मीदपुर", "तरक्कीपुर",
]

VILLAGE_NAMES_EN = [
    "Rampur", "Shivpur", "Narayanpur", "Gopalpur", "Krishnapur",
    "Haripur", "Ganeshpur", "Laxmipur", "Saraswatipur", "Durgapur",
    "Sitapur", "Radhapur", "Kamlapur", "Pushpapur", "Kusumpur",
    "Mohanpur", "Sohanpur", "Rajpur", "Vijaypur", "Amarpur",
    "Badagaon", "Chhotagaon", "Nai Basti", "Purana Kasba", "Majhgaon",
    "Sukhpur", "Anandpur", "Bharosapur", "Ummedpur", "Taraqqipur",
]

# Land class variants (canonical → Hi label)
LAND_CLASSES = [
    ("irrigated", "सिंचित"),
    ("unirrigated", "असिंचित"),
    ("barren", "बंजर"),
    ("abadi", "आबादी"),
    ("cultivable_barren", "कृषि योग्य बंजर"),
    ("orchard", "बाग"),
]

# Mutation reasons
MUTATION_REASONS_HI = [
    "विक्रय", "विरासत", "दान", "न्यायालय आदेश", "सरकारी अधिग्रहण",
    "बटवारा", "मृत्यु", "विवाह", "गोद लेना",
]

MUTATION_REASONS_EN = [
    "Sale", "Inheritance", "Gift", "Court Order", "Government Acquisition",
    "Partition", "Death", "Marriage", "Adoption",
]
