// src/locales/uzbek.js

const mainMenu = {
  browse_categories: "🛍 Onlayn do'kon",
  cart: "🛒 Savat",
  search_products: "🔍 Qidiruv",
  contact: "📞 Aloqa",
  help: "❓ Yordam",
  recommend_for_you: "⭐️ Siz uchun tavsiya etiladi",
  settings: "⚙️ Sozlamalar",
};

const uzbekTranslations = {
  // Til tanlash va umumiy xabarlar
  languages: {
    uz: "🇺🇿 O'zbekcha",
    en: "🇬🇧 English",
    ru: "🇷🇺 Русский",
  },
  select_language: "Iltimos, tilni tanlang:",
  invalid_language_selection:
    "Noto'g'ri til tanlovi. Iltimos, ro'yxatdan tanlang.",
  language_changed: "✅ Til muvaffaqiyatli o'zgartirildi!",

  start_command_description: "Botni ishga tushirish",
  admin_command_description: "Admin paneliga kirish",
  start_message:
    "Assalomu alaykum, {firstName}!😊 Botimizga xush kelibsiz. Quyidagi menyudan kerakli bo'limni tanlang:",
  main_menu_prompt: "Asosiy menyudasiz. Kerakli bo'limni tanlang:",
  unknown_command_general:
    "Kechirasiz, buyruq tushunarsiz. Iltimos, menyudagi tugmalardan foydalaning.",
  cancel_action: "Amal bekor qilindi. Asosiy menyuga qaytdingiz.",
  cancel_action_button: "❌ Bekor qilish", // reply keyboard
  skip_button: "➡️ O'tkazib yuborish", // reply keyboard
  sum: "so'm",
  category: "Kategoriya",
  unknown_category: "Noma'lum kategoriya",
  error_getting_file_link: "Fayl havolasini olishda xato yuz berdi.",
  product_data_missing:
    "Ma'lumotlar to'liq emas. Iltimos, qaytadan urinib ko'ring.",
  error_occurred: "Xato yuz berdi: {errorMessage}",
  yes: "✅ Ha",
  no: "❌ Yo'q",

  admin_manage_products: "🛒 Mahsulotlarni boshqarish",
  admin_manage_categories: "📂 Kategoriyalarni boshqarish",
  admin_view_orders: "📦 Buyurtmalar",
  admin_send_message: "✉️ Xabar yuborish",

  back_to_admin_main: "⬅️ Orqaga (admin menyu)",

  // Asosiy menyu (mainMenuKeyboard dan foydalanadigan)
  main_menu: mainMenu,
  back_to_main_menu_button_text: "⬅️ Asosiy menyu", // Reply klaviatura tugmasi matni

  // Admin paneli
  admin_panel_welcome:
    "Admin paneliga xush kelibsiz! Amallardan birini tanlang:",
  admin_panel_welcome_inline:
    "Admin paneliga xush kelibsiz! Amallardan birini tanlang:",
  unknown_admin_command: "Kechirasiz, admin buyrug'i tushunarsiz.",

  admin_menu: {
    // Faqat boshqa tugmalar yoki eski kalitlar bo'lsa, qoldiring, lekin yuqoridagilarni olib tashlang
    add_product: "➕ Mahsulot qo'shish",
    view_products: "📋 Mahsulotlarni ko'rish",
    add_category: "➕ Kategoriya qo'shish",
    view_categories: "📖 Kategoriyalarni ko'rish",
  },

  // Admin - Kategoriya boshqaruvi (categoryMenuKeyboard dan keladi)
  admin_manage_categories_prompt:
    "Kategoriyalar boshqaruvi bo'limidasiz. Amallardan birini tanlang:",
  admin_enter_category_name: "Yangi kategoriya nomini kiriting:",
  admin_category_name_required: "Kategoriya nomi majburiy.",
  admin_category_already_exists:
    "Bunday nomli kategoriya allaqachon mavjud. Iltimos, boshqa nom kiriting.",
  admin_category_added: "✅ '{name}' kategoriyasi muvaffaqiyatli qo'shildi!",
  admin_error_adding_category:
    "Kategoriya qo'shishda xato yuz berdi: {errorMessage}",
  admin_category_list_prompt: "Mavjud kategoriyalar:",
  no_categories_yet:
    "Hozircha hech qanday kategoriya mavjud emas. Yangi kategoriya qo'shishingiz mumkin.",
  admin_edit_category_prompt:
    "Kategoriyani tahrirlash/o'chirish uchun kategoriyani tanlang:",
  admin_category_selected:
    "Siz '<b>{categoryName}</b>' kategoriyasini tanladingiz. Nima qilmoqchisiz?",
  admin_edit_category_name:
    "Iltimos, '<b>{oldName}</b>' uchun yangi nom kiriting:",
  admin_category_updated:
    "✅ Kategoriya '<b>{oldName}</b>' dan '<b>{newName}</b>' ga muvaffaqiyatli o'zgartirildi!",
  admin_error_updating_category:
    "Kategoriyani yangilashda xato yuz berdi: {errorMessage}",
  admin_confirm_delete_category:
    "Siz '<b>{categoryName}</b>' kategoriyasini o'chirishga ishonchingiz komilmi? Bu kategoriya bilan bog'liq barcha mahsulotlar ham o'chiriladi.",
  admin_category_deleted: "✅ Kategoriya muvaffaqiyatli o'chirildi!",
  admin_error_deleting_category:
    "Kategoriyani o'chirishda xato yuz berdi: {errorMessage}",
  category_not_found: "Kategoriya topilmadi.",
  no_categories_found: "Hozircha hech qanday kategoriya topilmadi.",
  no_categories_to_view_products:
    "Mahsulotlarni ko'rish uchun avval kategoriya yaratishingiz kerak.",
  admin_select_category_to_view_products:
    "Mahsulotlarni ko'rish uchun kategoriya tanlang",

  // Admin - Mahsulot boshqaruvi (manageProductsKeyboard dan keladi)
  admin_manage_products_prompt:
    "Mahsulotlarni boshqarish bo'limidasiz. Amallardan birini tanlang:",
  admin_select_category_for_product:
    "Mahsulotni qaysi kategoriyaga qo'shmoqchisiz? Kategoriyani tanlang:",
  admin_no_categories_for_product:
    "Mahsulot qo'shish uchun avval kategoriya yaratishingiz kerak.",
  admin_enter_product_name:
    "🛍️ <b>Mahsulot nomini kiriting:</b>\n\nMasalan: iPhone 14 Pro, Samsung Galaxy S23, yoki mahsulot nomi...",
  admin_product_name_required:
    "❌ Mahsulot nomi majburiy. Iltimos, mahsulot nomini kiriting!",
  admin_enter_product_description:
    "📝 <b>Mahsulot tavsifini kiriting:</b>\n\nMahsulot haqida batafsil ma'lumot bering. Masalan: rang, o'lcham, xususiyatlar...",
  admin_product_description_required:
    "❌ Mahsulot tavsifi majburiy. Iltimos, mahsulot haqida ma'lumot bering!",
  admin_enter_product_price:
    "💰 <b>Mahsulot narxini kiriting:</b>\n\nFaqat raqam kiriting. Masalan: 1500000",
  admin_product_price_invalid:
    "❌ Noto'g'ri narx formati. Iltimos, faqat raqam kiriting!",

  admin_enter_product_image_url:
    "📸 <b>Mahsulot rasmini yuboring:</b>\n\nRasm faylini yoki rasm URL'ini yuboring:",
  admin_product_image_url_invalid:
    "Noto'g'ri rasm formati. Iltimos, rasm faylini yoki rasm URL'ini yuboring.",
  admin_product_data_missing:
    "Mahsulot ma'lumotlari to'liq emas. Iltimos, qaytadan urinib ko'ring.",
  admin_product_added: '✅  "{name}" mahsuloti muvaffaqiyatli qo\'shildi!',
  admin_error_adding_product:
    "Mahsulot qo'shishda xato yuz berdi: {errorMessage}",
  admin_select_category_for_viewing_products:
    "Mahsulotlarni ko'rish uchun kategoriya tanlang:",
  admin_product_list_prompt: "Mavjud mahsulotlar:",
  product_not_found_by_number:
    "Bu raqamdagi mahsulot topilmadi. Iltimos, to'g'ri raqamni kiriting.",
  error_loading_products:
    "Mahsulotlarni yuklashda xato yuz berdi: {errorMessage}",
  no_products_to_display: "Hozircha hech qanday mahsulot mavjud emas.",
  back_to_admin_main: "⬅️ Admin asosiy menyusiga qaytish",
  products_in_category: "<b>{categoryName}</b> kategoriyasidagi mahsulotlar",

  // Admin - Buyurtmalarni ko'rish
  admin_view_orders_prompt: "Buyurtmalar ro'yxati:",

  // Admin - Xabar yuborish
  admin_send_message_prompt:
    "Foydalanuvchilarga xabar yuborish uchun matn kiriting:",
  admin_message_text_required: "Xabar matni majburiy.",
  admin_message_sent_summary:
    "Xabar yuborish yakunlandi. Yuborildi: {sent} ta, Yuborilmadi: {failed} ta.",
  admin_error_sending_message:
    "Xabarni yuborishda xato yuz berdi: {errorMessage}",

  // Admin - Sozlamalar (adminLanguageKeyboard dan keladi)

  // Foydalanuvchi - Onlayn do'kon
  user_select_category_prompt:
    "Mahsulotlarni ko'rish uchun kategoriyani tanlang:",
  no_categories_yet_user: "Hozircha hech qanday kategoriya mavjud emas.",
  select_product_number_by_category:
    "<b>{categoryName}</b> kategoriyasidagi mahsulotlar:",
  no_products_in_category:
    "Ushbu kategoriyada hozircha mahsulotlar mavjud emas.",
  back_to_categories: "⬅️ Kategoriyalarga qaytish",

  // Foydalanuvchi - Mahsulot tafsilotlari
  product_details_caption:
    "<b>Nomi:</b> {name}\n<b>Tavsifi:</b> {description}\n<b>Narxi:</b> {price} so'm\n\n📢 <b>Kanalimizga qo'shiling:</b> @denaroma_oqbilol",
  add_to_cart: "🛒 Savatga qo'shish",
  back_to_products: "⬅️ Mahsulotlarga qaytish",
  back_to_main_menu: "⬅️ Asosiy menyuga qaytish",
  product_added_to_cart: "✅ Mahsulot savatga qo'shildi!",
  edit: "✏️ Tahrirlash",
  delete: "🗑️ O'chirish",
  product_not_found: "Mahsulot topilmadi.",
  category_not_found_in_state: "Holatda kategoriya topilmadi.",

  // Foydalanuvchi - Savat
  cart_section_welcome: "Sizning savatingiz:",
  cart_empty_message: "Savat bo‘sh. Mahsulot qo‘shing!",

  // Foydalanuvchi - Aloqa
  contact_prompt:
    "Biz bilan bog'lanish uchun: +998XX-XXX-XX-XX\nBizning ijtimoiy tarmoqlarimiz:\nTelegram: t.me/example\nInstagram: instagram.com/example",

  // Foydalanuvchi - Qidiruv
  enter_search_query: "Qidirmoqchi bo'lgan mahsulot nomini kiriting:",
  searching_for_products: "Mahsulotlar qidirilmoqda: '<b>{query}</b>'",
  search_results_for: "«{query}» uchun qidiruv natijalari",
  no_search_results: "«{query}» bo'yicha hech qanday natija topilmadi.",

  // Sahifalash (pagination)
  previous_page: "⬅️ Oldingi sahifa",
  next_page: "Keyingi sahifa ➡️",

  // Xato xabarlari
  error_loading_categories:
    "Kategoriyalarni yuklashda xato yuz berdi: {errorMessage}",
  error_loading_data:
    "Ma'lumotlarni yuklashda xato yuz berdi. Iltimos, qaytadan urinib ko'ring.",
  error_processing_request:
    "So'rovni qayta ishlashda xato yuz berdi. Iltimos, keyinroq urinib ko'ring.",

  // Foydalanuvchi sozlamalari (settingsMenu va languageSelectionKeyboard bilan bog'liq)
  settings_prompt: "Sozlamalar menyusi.",
  user_awaiting_language_selection: "Iltimos, tilni tanlang:",

  // Men so'nggi paytlarda bergan tarjimalar:
  send_image_or_url_error:
    "Iltimos, mahsulot rasmi uchun to'g'ri URL manzilini kiriting yoki rasm yuboring.",
  invalid_url_format_error:
    "Noto'g'ri URL formati. URL 'http://' yoki 'https://' bilan boshlanishi kerak.",
  image_processing_error:
    "Rasmni qayta ishlashda xato yuz berdi. Iltimos, qayta urinib ko'ring yoki URL yuboring.",
  error_product_data_missing:
    "Mahsulot ma'lumotlari topilmadi. Iltimos, boshidan boshlang.",
  operation_cancelled: "Amaliyot bekor qilindi.",
  admin_enter_product_stock: "Mahsulot sonini kiriting (nechta dona mavjud):",
  admin_product_stock_invalid:
    "Noto'g'ri son. Iltimos, faqat butun son kiriting.",
  admin_product_deleted: "✅ Mahsulot muvaffaqiyatli o'chirildi!",
  enter_quantity: "Nechta dona qo‘shmoqchisiz? Raqam yuboring:",
  invalid_quantity: "Noto‘g‘ri miqdor. Iltimos, to‘g‘ri raqam yuboring!",

  // Savat va to'lov
  view_cart_items: "🛒 Savatdagi mahsulotlar",
  checkout: "✅ Buyurtma berish",
  clear_cart: "🗑️ Savatni tozalash",

  // To'lov usullari
  payment_methods: {
    cash_on_delivery: "Naqd to'lov (kuryerga)",
    card_payment: "Karta orqali to'lov",
  },

  // Sozlamalar menyusi
  settings_menu: {
    change_phone: "📱 Telefon raqamini o'zgartirish",
  },
  enter_phone_number: "Telefon raqamingizni kiriting (masalan, +998901234567):",
  invalid_phone_number:
    "Telefon raqami noto‘g‘ri. Iltimos, +998 bilan yoki 9 ta raqamli formatda kiriting!",
  enter_address: "Yetkazib berish manzilini kiriting:",
  invalid_address:
    "Manzil juda qisqa yoki noto‘g‘ri. Iltimos, to‘liq manzil kiriting!",
  order_success:
    "🎊 Tabriklaymiz! Buyurtmangiz adminga yetkazildi\n\n⏱️ Tez orada siz bilan bog'lanamiz\n📱 Telefon: +998 77 737 00 95\n\nRahmat! 😊",
  cart_cleared: "Savat tozalandi!",
  admin:
    "Admin bilan bog'lanish uchun: @denaroma_oqbilol_admin yoki telefon: +998 77 737 00 95",
  not_admin_error:
    "🚫 Kechirasiz, bu bo'lim faqat adminlar uchun. Sizda admin huquqlari mavjud emas.\n\nAsosiy menyudan foydalanishingiz mumkin.",

  // --- Yangi AI va zamonaviy funksiyalar uchun ---
  admin_trend_stats: "📊 Trend va statistika",
  trend_stats_title: "📊 Trend va statistika:",
  trend_stats_uncategorized: "Kategoriyasiz mahsulotlar: <b>{count} ta</b>",
  trend_stats_top_tags: "Eng ko‘p ishlatilgan xeshteglar:",
  trend_stats_tag_item: "{index}. {tag} ({count} ta)",

  bulk_categorize_selected: "🚀 Bulk kategoriyalash ({count} ta)",
  bulk_cancel: "❌ Bekor qilish",
  bulk_assign_success: "Tanlangan mahsulotlar muvaffaqiyatli kategoriyalandi!",
  bulk_nothing_selected: "Hech qanday mahsulot tanlanmagan!",

  ai_suggested_category: "🤖 AI tavsiyasi: {category}",
  ai_suggested_tags: "🏷️ AI xeshteglari: {tags}",

  recommend_for_you_title: "⭐️ Siz uchun tavsiya etiladi:",
  recommend_for_you_none:
    "Afsuski, siz uchun tavsiya etiladigan mahsulotlar topilmadi.",

  delete_invalid_products: "🗑️ ID yo‘q mahsulotlarni tozalash",
  delete_invalid_products_success: "ID’siz mahsulotlar bazadan tozalandi!",

  translit_notice: "Siz krilchada yozdingiz, javob lotinda yuborildi.",

  select_product: "⬜️ Tanlash",
  unselect_product: "✅ Tanlangan",
  categorize_product: "{index}. Kategoriyalash",
  categorize_product_invalid: "Xatolik: mahsulot topilmadi yoki ID noto‘g‘ri.",
};

export default uzbekTranslations;
