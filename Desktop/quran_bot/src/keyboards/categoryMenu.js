// src/keyboards/categoryMenu.js

import { getTranslation } from '../utils/i18n.js';

export const manageCategoriesKeyboard = (userLanguage = 'uzbek') => { // <<< userLanguage qo'shildi
    const _ = (key, replacements) => getTranslation(key, replacements, userLanguage); // Tilni uzatish
    return {
        inline_keyboard: [ // Kategoriyalarni boshqarish ham inline bo'lishi kerak
            [{ text: _('admin_menu.add_category'), callback_data: 'add_category' }],
            [{ text: _('admin_menu.view_categories'), callback_data: 'view_categories' }],
            [{ text: _('back_to_admin_main'), callback_data: 'back_to_admin_main' }]
        ]
    };
};

export const confirmDeleteCategoryKeyboard = (categoryId, userLanguage = 'uzbek') => { // <<< userLanguage qo'shildi
    const _ = (key, replacements) => getTranslation(key, replacements, userLanguage); // Tilni uzatish
    return {
        inline_keyboard: [
            [{ text: _('yes'), callback_data: `confirm_delete_category_${categoryId}` }, { text: _('no'), callback_data: 'cancel_delete_category' }]
        ]
    };
};

export const productCategorySelectionKeyboard = (categories, userLanguage = 'uzbek') => { // <<< userLanguage qo'shildi
    const _ = (key, replacements) => getTranslation(key, replacements, userLanguage); // Tilni uzatish
    const keyboard = categories.map(category => ([
        { text: category.name, callback_data: `product_category_selected_${category._id}` }
    ]));
    keyboard.push([{ text: _('cancel_action_button'), callback_data: 'cancel_add_product' }]);
    return { inline_keyboard: keyboard };
};