// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '../../hooks/useTranslation';
import { EMRSelect } from '../shared/EMRFormFields';

interface CitizenshipSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

interface Country {
  value: string;
  label: string;
  labelKa: string;
  labelEn: string;
  labelRu: string;
}

/**
 * Comprehensive list of 250 countries and territories with ISO 3166-1 alpha-2 codes
 * Includes flag emojis and translations in Georgian (ka), English (en), Russian (ru)
 */
const countries: Country[] = [
  { value: 'AF', label: '🇦🇫 Afghanistan', labelKa: '🇦🇫 ავღანეთი', labelEn: '🇦🇫 Afghanistan', labelRu: '🇦🇫 Афганистан' },
  { value: 'AX', label: '🇦🇽 Åland Islands', labelKa: '🇦🇽 ალანდის კუნძულები', labelEn: '🇦🇽 Åland Islands', labelRu: '🇦🇽 Аландские острова' },
  { value: 'AL', label: '🇦🇱 Albania', labelKa: '🇦🇱 ალბანეთი', labelEn: '🇦🇱 Albania', labelRu: '🇦🇱 Албания' },
  { value: 'DZ', label: '🇩🇿 Algeria', labelKa: '🇩🇿 ალჟირი', labelEn: '🇩🇿 Algeria', labelRu: '🇩🇿 Алжир' },
  { value: 'AS', label: '🇦🇸 American Samoa', labelKa: '🇦🇸 ამერიკული სამოა', labelEn: '🇦🇸 American Samoa', labelRu: '🇦🇸 Американское Самоа' },
  { value: 'AD', label: '🇦🇩 Andorra', labelKa: '🇦🇩 ანდორა', labelEn: '🇦🇩 Andorra', labelRu: '🇦🇩 Андорра' },
  { value: 'AO', label: '🇦🇴 Angola', labelKa: '🇦🇴 ანგოლა', labelEn: '🇦🇴 Angola', labelRu: '🇦🇴 Ангола' },
  { value: 'AI', label: '🇦🇮 Anguilla', labelKa: '🇦🇮 ანგილია', labelEn: '🇦🇮 Anguilla', labelRu: '🇦🇮 Ангилья' },
  { value: 'AQ', label: '🇦🇶 Antarctica', labelKa: '🇦🇶 ანტარქტიდა', labelEn: '🇦🇶 Antarctica', labelRu: '🇦🇶 Антарктида' },
  { value: 'AG', label: '🇦🇬 Antigua and Barbuda', labelKa: '🇦🇬 ანტიგუა და ბარბუდა', labelEn: '🇦🇬 Antigua and Barbuda', labelRu: '🇦🇬 Антигуа и Барбуда' },
  { value: 'AR', label: '🇦🇷 Argentina', labelKa: '🇦🇷 არგენტინა', labelEn: '🇦🇷 Argentina', labelRu: '🇦🇷 Аргентина' },
  { value: 'AM', label: '🇦🇲 Armenia', labelKa: '🇦🇲 სომხეთი', labelEn: '🇦🇲 Armenia', labelRu: '🇦🇲 Армения' },
  { value: 'AW', label: '🇦🇼 Aruba', labelKa: '🇦🇼 არუბა', labelEn: '🇦🇼 Aruba', labelRu: '🇦🇼 Аруба' },
  { value: 'AU', label: '🇦🇺 Australia', labelKa: '🇦🇺 ავსტრალია', labelEn: '🇦🇺 Australia', labelRu: '🇦🇺 Австралия' },
  { value: 'AT', label: '🇦🇹 Austria', labelKa: '🇦🇹 ავსტრია', labelEn: '🇦🇹 Austria', labelRu: '🇦🇹 Австрия' },
  { value: 'AZ', label: '🇦🇿 Azerbaijan', labelKa: '🇦🇿 აზერბაიჯანი', labelEn: '🇦🇿 Azerbaijan', labelRu: '🇦🇿 Азербайджан' },
  { value: 'BS', label: '🇧🇸 Bahamas', labelKa: '🇧🇸 ბაჰამის კუნძულები', labelEn: '🇧🇸 Bahamas', labelRu: '🇧🇸 Багамские Острова' },
  { value: 'BH', label: '🇧🇭 Bahrain', labelKa: '🇧🇭 ბაჰრეინი', labelEn: '🇧🇭 Bahrain', labelRu: '🇧🇭 Бахрейн' },
  { value: 'BD', label: '🇧🇩 Bangladesh', labelKa: '🇧🇩 ბანგლადეში', labelEn: '🇧🇩 Bangladesh', labelRu: '🇧🇩 Бангладеш' },
  { value: 'BB', label: '🇧🇧 Barbados', labelKa: '🇧🇧 ბარბადოსი', labelEn: '🇧🇧 Barbados', labelRu: '🇧🇧 Барбадос' },
  { value: 'BY', label: '🇧🇾 Belarus', labelKa: '🇧🇾 ბელარუსი', labelEn: '🇧🇾 Belarus', labelRu: '🇧🇾 Беларусь' },
  { value: 'BE', label: '🇧🇪 Belgium', labelKa: '🇧🇪 ბელგია', labelEn: '🇧🇪 Belgium', labelRu: '🇧🇪 Бельгия' },
  { value: 'BZ', label: '🇧🇿 Belize', labelKa: '🇧🇿 ბელიზი', labelEn: '🇧🇿 Belize', labelRu: '🇧🇿 Белиз' },
  { value: 'BJ', label: '🇧🇯 Benin', labelKa: '🇧🇯 ბენინი', labelEn: '🇧🇯 Benin', labelRu: '🇧🇯 Бенин' },
  { value: 'BM', label: '🇧🇲 Bermuda', labelKa: '🇧🇲 ბერმუდის კუნძულები', labelEn: '🇧🇲 Bermuda', labelRu: '🇧🇲 Бермудские Острова' },
  { value: 'BT', label: '🇧🇹 Bhutan', labelKa: '🇧🇹 ბუტანი', labelEn: '🇧🇹 Bhutan', labelRu: '🇧🇹 Бутан' },
  { value: 'BO', label: '🇧🇴 Bolivia', labelKa: '🇧🇴 ბოლივია', labelEn: '🇧🇴 Bolivia', labelRu: '🇧🇴 Боливия' },
  { value: 'BQ', label: '🇧🇶 Bonaire, Sint Eustatius and Saba', labelKa: '🇧🇶 ბონერი, სინტ-ევსტატიუსი და საბა', labelEn: '🇧🇶 Bonaire, Sint Eustatius and Saba', labelRu: '🇧🇶 Бонайре, Синт-Эстатиус и Саба' },
  { value: 'BA', label: '🇧🇦 Bosnia and Herzegovina', labelKa: '🇧🇦 ბოსნია და ჰერცეგოვინა', labelEn: '🇧🇦 Bosnia and Herzegovina', labelRu: '🇧🇦 Босния и Герцеговина' },
  { value: 'BW', label: '🇧🇼 Botswana', labelKa: '🇧🇼 ბოტსვანა', labelEn: '🇧🇼 Botswana', labelRu: '🇧🇼 Ботсвана' },
  { value: 'BV', label: '🇧🇻 Bouvet Island', labelKa: '🇧🇻 ბუვე', labelEn: '🇧🇻 Bouvet Island', labelRu: '🇧🇻 Остров Буве' },
  { value: 'BR', label: '🇧🇷 Brazil', labelKa: '🇧🇷 ბრაზილია', labelEn: '🇧🇷 Brazil', labelRu: '🇧🇷 Бразилия' },
  { value: 'IO', label: '🇮🇴 British Indian Ocean Territory', labelKa: '🇮🇴 ბრიტანეთის ტერიტორია ინდოეთის ოკეანეში', labelEn: '🇮🇴 British Indian Ocean Territory', labelRu: '🇮🇴 Британская территория в Индийском океане' },
  { value: 'BN', label: '🇧🇳 Brunei Darussalam', labelKa: '🇧🇳 ბრუნეი', labelEn: '🇧🇳 Brunei Darussalam', labelRu: '🇧🇳 Бруней' },
  { value: 'BG', label: '🇧🇬 Bulgaria', labelKa: '🇧🇬 ბულგარეთი', labelEn: '🇧🇬 Bulgaria', labelRu: '🇧🇬 Болгария' },
  { value: 'BF', label: '🇧🇫 Burkina Faso', labelKa: '🇧🇫 ბურკინა-ფასო', labelEn: '🇧🇫 Burkina Faso', labelRu: '🇧🇫 Буркина-Фасо' },
  { value: 'BI', label: '🇧🇮 Burundi', labelKa: '🇧🇮 ბურუნდი', labelEn: '🇧🇮 Burundi', labelRu: '🇧🇮 Бурунди' },
  { value: 'CV', label: '🇨🇻 Cabo Verde', labelKa: '🇨🇻 კაბო-ვერდე', labelEn: '🇨🇻 Cabo Verde', labelRu: '🇨🇻 Кабо-Верде' },
  { value: 'KH', label: '🇰🇭 Cambodia', labelKa: '🇰🇭 კამბოჯა', labelEn: '🇰🇭 Cambodia', labelRu: '🇰🇭 Камбоджа' },
  { value: 'CM', label: '🇨🇲 Cameroon', labelKa: '🇨🇲 კამერუნი', labelEn: '🇨🇲 Cameroon', labelRu: '🇨🇲 Камерун' },
  { value: 'CA', label: '🇨🇦 Canada', labelKa: '🇨🇦 კანადა', labelEn: '🇨🇦 Canada', labelRu: '🇨🇦 Канада' },
  { value: 'KY', label: '🇰🇾 Cayman Islands', labelKa: '🇰🇾 კაიმანის კუნძულები', labelEn: '🇰🇾 Cayman Islands', labelRu: '🇰🇾 Каймановы острова' },
  { value: 'CF', label: '🇨🇫 Central African Republic', labelKa: '🇨🇫 ცენტრალური აფრიკის რესპუბლიკა', labelEn: '🇨🇫 Central African Republic', labelRu: '🇨🇫 Центральноафриканская Республика' },
  { value: 'TD', label: '🇹🇩 Chad', labelKa: '🇹🇩 ჩადი', labelEn: '🇹🇩 Chad', labelRu: '🇹🇩 Чад' },
  { value: 'CL', label: '🇨🇱 Chile', labelKa: '🇨🇱 ჩილე', labelEn: '🇨🇱 Chile', labelRu: '🇨🇱 Чили' },
  { value: 'CN', label: '🇨🇳 China', labelKa: '🇨🇳 ჩინეთი', labelEn: '🇨🇳 China', labelRu: '🇨🇳 Китай' },
  { value: 'CX', label: '🇨🇽 Christmas Island', labelKa: '🇨🇽 შობის კუნძული', labelEn: '🇨🇽 Christmas Island', labelRu: '🇨🇽 Остров Рождества' },
  { value: 'CC', label: '🇨🇨 Cocos (Keeling) Islands', labelKa: '🇨🇨 ქოქოსის (კილინგის) კუნძულები', labelEn: '🇨🇨 Cocos (Keeling) Islands', labelRu: '🇨🇨 Кокосовые острова' },
  { value: 'CO', label: '🇨🇴 Colombia', labelKa: '🇨🇴 კოლუმბია', labelEn: '🇨🇴 Colombia', labelRu: '🇨🇴 Колумбия' },
  { value: 'KM', label: '🇰🇲 Comoros', labelKa: '🇰🇲 კომორის კუნძულები', labelEn: '🇰🇲 Comoros', labelRu: '🇰🇲 Коморы' },
  { value: 'CG', label: '🇨🇬 Congo', labelKa: '🇨🇬 კონგო', labelEn: '🇨🇬 Congo', labelRu: '🇨🇬 Конго' },
  { value: 'CD', label: '🇨🇩 Congo (Democratic Republic)', labelKa: '🇨🇩 კონგოს დემოკრატიული რესპუბლიკა', labelEn: '🇨🇩 Congo (Democratic Republic)', labelRu: '🇨🇩 Демократическая Республика Конго' },
  { value: 'CK', label: '🇨🇰 Cook Islands', labelKa: '🇨🇰 კუკის კუნძულები', labelEn: '🇨🇰 Cook Islands', labelRu: '🇨🇰 Острова Кука' },
  { value: 'CR', label: '🇨🇷 Costa Rica', labelKa: '🇨🇷 კოსტა-რიკა', labelEn: '🇨🇷 Costa Rica', labelRu: '🇨🇷 Коста-Рика' },
  { value: 'CI', label: '🇨🇮 Côte d\'Ivoire', labelKa: '🇨🇮 კოტ-დ\'ივუარი', labelEn: '🇨🇮 Côte d\'Ivoire', labelRu: '🇨🇮 Кот-д\'Ивуар' },
  { value: 'HR', label: '🇭🇷 Croatia', labelKa: '🇭🇷 ხორვატია', labelEn: '🇭🇷 Croatia', labelRu: '🇭🇷 Хорватия' },
  { value: 'CU', label: '🇨🇺 Cuba', labelKa: '🇨🇺 კუბა', labelEn: '🇨🇺 Cuba', labelRu: '🇨🇺 Куба' },
  { value: 'CW', label: '🇨🇼 Curaçao', labelKa: '🇨🇼 კიურასაო', labelEn: '🇨🇼 Curaçao', labelRu: '🇨🇼 Кюрасао' },
  { value: 'CY', label: '🇨🇾 Cyprus', labelKa: '🇨🇾 კვიპროსი', labelEn: '🇨🇾 Cyprus', labelRu: '🇨🇾 Кипр' },
  { value: 'CZ', label: '🇨🇿 Czechia', labelKa: '🇨🇿 ჩეხეთი', labelEn: '🇨🇿 Czechia', labelRu: '🇨🇿 Чехия' },
  { value: 'DK', label: '🇩🇰 Denmark', labelKa: '🇩🇰 დანია', labelEn: '🇩🇰 Denmark', labelRu: '🇩🇰 Дания' },
  { value: 'DJ', label: '🇩🇯 Djibouti', labelKa: '🇩🇯 ჯიბუტი', labelEn: '🇩🇯 Djibouti', labelRu: '🇩🇯 Джибути' },
  { value: 'DM', label: '🇩🇲 Dominica', labelKa: '🇩🇲 დომინიკა', labelEn: '🇩🇲 Dominica', labelRu: '🇩🇲 Доминика' },
  { value: 'DO', label: '🇩🇴 Dominican Republic', labelKa: '🇩🇴 დომინიკელთა რესპუბლიკა', labelEn: '🇩🇴 Dominican Republic', labelRu: '🇩🇴 Доминиканская Республика' },
  { value: 'EC', label: '🇪🇨 Ecuador', labelKa: '🇪🇨 ეკვადორი', labelEn: '🇪🇨 Ecuador', labelRu: '🇪🇨 Эквадор' },
  { value: 'EG', label: '🇪🇬 Egypt', labelKa: '🇪🇬 ეგვიპტე', labelEn: '🇪🇬 Egypt', labelRu: '🇪🇬 Египет' },
  { value: 'SV', label: '🇸🇻 El Salvador', labelKa: '🇸🇻 სალვადორი', labelEn: '🇸🇻 El Salvador', labelRu: '🇸🇻 Сальвадор' },
  { value: 'GQ', label: '🇬🇶 Equatorial Guinea', labelKa: '🇬🇶 ეკვატორული გვინეა', labelEn: '🇬🇶 Equatorial Guinea', labelRu: '🇬🇶 Экваториальная Гвинея' },
  { value: 'ER', label: '🇪🇷 Eritrea', labelKa: '🇪🇷 ერიტრეა', labelEn: '🇪🇷 Eritrea', labelRu: '🇪🇷 Эритрея' },
  { value: 'EE', label: '🇪🇪 Estonia', labelKa: '🇪🇪 ესტონეთი', labelEn: '🇪🇪 Estonia', labelRu: '🇪🇪 Эстония' },
  { value: 'SZ', label: '🇸🇿 Eswatini', labelKa: '🇸🇿 ესვატინი', labelEn: '🇸🇿 Eswatini', labelRu: '🇸🇿 Эсватини' },
  { value: 'ET', label: '🇪🇹 Ethiopia', labelKa: '🇪🇹 ეთიოპია', labelEn: '🇪🇹 Ethiopia', labelRu: '🇪🇹 Эфиопия' },
  { value: 'FK', label: '🇫🇰 Falkland Islands', labelKa: '🇫🇰 ფოლკლენდის კუნძულები', labelEn: '🇫🇰 Falkland Islands', labelRu: '🇫🇰 Фолклендские острова' },
  { value: 'FO', label: '🇫🇴 Faroe Islands', labelKa: '🇫🇴 ფარერის კუნძულები', labelEn: '🇫🇴 Faroe Islands', labelRu: '🇫🇴 Фарерские острова' },
  { value: 'FJ', label: '🇫🇯 Fiji', labelKa: '🇫🇯 ფიჯი', labelEn: '🇫🇯 Fiji', labelRu: '🇫🇯 Фиджи' },
  { value: 'FI', label: '🇫🇮 Finland', labelKa: '🇫🇮 ფინეთი', labelEn: '🇫🇮 Finland', labelRu: '🇫🇮 Финляндия' },
  { value: 'FR', label: '🇫🇷 France', labelKa: '🇫🇷 საფრანგეთი', labelEn: '🇫🇷 France', labelRu: '🇫🇷 Франция' },
  { value: 'GF', label: '🇬🇫 French Guiana', labelKa: '🇬🇫 საფრანგეთის გვიანა', labelEn: '🇬🇫 French Guiana', labelRu: '🇬🇫 Французская Гвиана' },
  { value: 'PF', label: '🇵🇫 French Polynesia', labelKa: '🇵🇫 საფრანგეთის პოლინეზია', labelEn: '🇵🇫 French Polynesia', labelRu: '🇵🇫 Французская Полинезия' },
  { value: 'TF', label: '🇹🇫 French Southern Territories', labelKa: '🇹🇫 საფრანგეთის სამხრეთის ტერიტორიები', labelEn: '🇹🇫 French Southern Territories', labelRu: '🇹🇫 Французские Южные территории' },
  { value: 'GA', label: '🇬🇦 Gabon', labelKa: '🇬🇦 გაბონი', labelEn: '🇬🇦 Gabon', labelRu: '🇬🇦 Габон' },
  { value: 'GM', label: '🇬🇲 Gambia', labelKa: '🇬🇲 გამბია', labelEn: '🇬🇲 Gambia', labelRu: '🇬🇲 Гамбия' },
  { value: 'GE', label: '🇬🇪 Georgia', labelKa: '🇬🇪 საქართველო', labelEn: '🇬🇪 Georgia', labelRu: '🇬🇪 Грузия' },
  { value: 'DE', label: '🇩🇪 Germany', labelKa: '🇩🇪 გერმანია', labelEn: '🇩🇪 Germany', labelRu: '🇩🇪 Германия' },
  { value: 'GH', label: '🇬🇭 Ghana', labelKa: '🇬🇭 განა', labelEn: '🇬🇭 Ghana', labelRu: '🇬🇭 Гана' },
  { value: 'GI', label: '🇬🇮 Gibraltar', labelKa: '🇬🇮 გიბრალტარი', labelEn: '🇬🇮 Gibraltar', labelRu: '🇬🇮 Гибралтар' },
  { value: 'GR', label: '🇬🇷 Greece', labelKa: '🇬🇷 საბერძნეთი', labelEn: '🇬🇷 Greece', labelRu: '🇬🇷 Греция' },
  { value: 'GL', label: '🇬🇱 Greenland', labelKa: '🇬🇱 გრენლანდია', labelEn: '🇬🇱 Greenland', labelRu: '🇬🇱 Гренландия' },
  { value: 'GD', label: '🇬🇩 Grenada', labelKa: '🇬🇩 გრენადა', labelEn: '🇬🇩 Grenada', labelRu: '🇬🇩 Гренада' },
  { value: 'GP', label: '🇬🇵 Guadeloupe', labelKa: '🇬🇵 გვადელუპა', labelEn: '🇬🇵 Guadeloupe', labelRu: '🇬🇵 Гваделупа' },
  { value: 'GU', label: '🇬🇺 Guam', labelKa: '🇬🇺 გუამი', labelEn: '🇬🇺 Guam', labelRu: '🇬🇺 Гуам' },
  { value: 'GT', label: '🇬🇹 Guatemala', labelKa: '🇬🇹 გვატემალა', labelEn: '🇬🇹 Guatemala', labelRu: '🇬🇹 Гватемала' },
  { value: 'GG', label: '🇬🇬 Guernsey', labelKa: '🇬🇬 გერნსი', labelEn: '🇬🇬 Guernsey', labelRu: '🇬🇬 Гернси' },
  { value: 'GN', label: '🇬🇳 Guinea', labelKa: '🇬🇳 გვინეა', labelEn: '🇬🇳 Guinea', labelRu: '🇬🇳 Гвинея' },
  { value: 'GW', label: '🇬🇼 Guinea-Bissau', labelKa: '🇬🇼 გვინეა-ბისაუ', labelEn: '🇬🇼 Guinea-Bissau', labelRu: '🇬🇼 Гвинея-Бисау' },
  { value: 'GY', label: '🇬🇾 Guyana', labelKa: '🇬🇾 გაიანა', labelEn: '🇬🇾 Guyana', labelRu: '🇬🇾 Гайана' },
  { value: 'HT', label: '🇭🇹 Haiti', labelKa: '🇭🇹 ჰაიტი', labelEn: '🇭🇹 Haiti', labelRu: '🇭🇹 Гаити' },
  { value: 'HM', label: '🇭🇲 Heard Island and McDonald Islands', labelKa: '🇭🇲 ჰერდი და მაკდონალდის კუნძულები', labelEn: '🇭🇲 Heard Island and McDonald Islands', labelRu: '🇭🇲 Остров Херд и острова Макдональд' },
  { value: 'VA', label: '🇻🇦 Holy See', labelKa: '🇻🇦 ვატიკანი', labelEn: '🇻🇦 Holy See', labelRu: '🇻🇦 Ватикан' },
  { value: 'HN', label: '🇭🇳 Honduras', labelKa: '🇭🇳 ჰონდურასი', labelEn: '🇭🇳 Honduras', labelRu: '🇭🇳 Гондурас' },
  { value: 'HK', label: '🇭🇰 Hong Kong', labelKa: '🇭🇰 ჰონგ-კონგი', labelEn: '🇭🇰 Hong Kong', labelRu: '🇭🇰 Гонконг' },
  { value: 'HU', label: '🇭🇺 Hungary', labelKa: '🇭🇺 უნგრეთი', labelEn: '🇭🇺 Hungary', labelRu: '🇭🇺 Венгрия' },
  { value: 'IS', label: '🇮🇸 Iceland', labelKa: '🇮🇸 ისლანდია', labelEn: '🇮🇸 Iceland', labelRu: '🇮🇸 Исландия' },
  { value: 'IN', label: '🇮🇳 India', labelKa: '🇮🇳 ინდოეთი', labelEn: '🇮🇳 India', labelRu: '🇮🇳 Индия' },
  { value: 'ID', label: '🇮🇩 Indonesia', labelKa: '🇮🇩 ინდონეზია', labelEn: '🇮🇩 Indonesia', labelRu: '🇮🇩 Индонезия' },
  { value: 'IR', label: '🇮🇷 Iran', labelKa: '🇮🇷 ირანი', labelEn: '🇮🇷 Iran', labelRu: '🇮🇷 Иран' },
  { value: 'IQ', label: '🇮🇶 Iraq', labelKa: '🇮🇶 ერაყი', labelEn: '🇮🇶 Iraq', labelRu: '🇮🇶 Ирак' },
  { value: 'IE', label: '🇮🇪 Ireland', labelKa: '🇮🇪 ირლანდია', labelEn: '🇮🇪 Ireland', labelRu: '🇮🇪 Ирландия' },
  { value: 'IM', label: '🇮🇲 Isle of Man', labelKa: '🇮🇲 მენის კუნძული', labelEn: '🇮🇲 Isle of Man', labelRu: '🇮🇲 Остров Мэн' },
  { value: 'IL', label: '🇮🇱 Israel', labelKa: '🇮🇱 ისრაელი', labelEn: '🇮🇱 Israel', labelRu: '🇮🇱 Израиль' },
  { value: 'IT', label: '🇮🇹 Italy', labelKa: '🇮🇹 იტალია', labelEn: '🇮🇹 Italy', labelRu: '🇮🇹 Италия' },
  { value: 'JM', label: '🇯🇲 Jamaica', labelKa: '🇯🇲 იამაიკა', labelEn: '🇯🇲 Jamaica', labelRu: '🇯🇲 Ямайка' },
  { value: 'JP', label: '🇯🇵 Japan', labelKa: '🇯🇵 იაპონია', labelEn: '🇯🇵 Japan', labelRu: '🇯🇵 Япония' },
  { value: 'JE', label: '🇯🇪 Jersey', labelKa: '🇯🇪 ჯერსი', labelEn: '🇯🇪 Jersey', labelRu: '🇯🇪 Джерси' },
  { value: 'JO', label: '🇯🇴 Jordan', labelKa: '🇯🇴 იორდანია', labelEn: '🇯🇴 Jordan', labelRu: '🇯🇴 Иордания' },
  { value: 'KZ', label: '🇰🇿 Kazakhstan', labelKa: '🇰🇿 ყაზახეთი', labelEn: '🇰🇿 Kazakhstan', labelRu: '🇰🇿 Казахстан' },
  { value: 'KE', label: '🇰🇪 Kenya', labelKa: '🇰🇪 კენია', labelEn: '🇰🇪 Kenya', labelRu: '🇰🇪 Кения' },
  { value: 'KI', label: '🇰🇮 Kiribati', labelKa: '🇰🇮 კირიბატი', labelEn: '🇰🇮 Kiribati', labelRu: '🇰🇮 Кирибати' },
  { value: 'KP', label: '🇰🇵 North Korea', labelKa: '🇰🇵 ჩრდილოეთ კორეა', labelEn: '🇰🇵 North Korea', labelRu: '🇰🇵 Северная Корея' },
  { value: 'KR', label: '🇰🇷 South Korea', labelKa: '🇰🇷 სამხრეთ კორეა', labelEn: '🇰🇷 South Korea', labelRu: '🇰🇷 Южная Корея' },
  { value: 'KW', label: '🇰🇼 Kuwait', labelKa: '🇰🇼 ქუვეითი', labelEn: '🇰🇼 Kuwait', labelRu: '🇰🇼 Кувейт' },
  { value: 'KG', label: '🇰🇬 Kyrgyzstan', labelKa: '🇰🇬 ყირგიზეთი', labelEn: '🇰🇬 Kyrgyzstan', labelRu: '🇰🇬 Киргизия' },
  { value: 'LA', label: '🇱🇦 Laos', labelKa: '🇱🇦 ლაოსი', labelEn: '🇱🇦 Laos', labelRu: '🇱🇦 Лаос' },
  { value: 'LV', label: '🇱🇻 Latvia', labelKa: '🇱🇻 ლატვია', labelEn: '🇱🇻 Latvia', labelRu: '🇱🇻 Латвия' },
  { value: 'LB', label: '🇱🇧 Lebanon', labelKa: '🇱🇧 ლიბანი', labelEn: '🇱🇧 Lebanon', labelRu: '🇱🇧 Ливан' },
  { value: 'LS', label: '🇱🇸 Lesotho', labelKa: '🇱🇸 ლესოთო', labelEn: '🇱🇸 Lesotho', labelRu: '🇱🇸 Лесото' },
  { value: 'LR', label: '🇱🇷 Liberia', labelKa: '🇱🇷 ლიბერია', labelEn: '🇱🇷 Liberia', labelRu: '🇱🇷 Либерия' },
  { value: 'LY', label: '🇱🇾 Libya', labelKa: '🇱🇾 ლიბია', labelEn: '🇱🇾 Libya', labelRu: '🇱🇾 Ливия' },
  { value: 'LI', label: '🇱🇮 Liechtenstein', labelKa: '🇱🇮 ლიხტენშტაინი', labelEn: '🇱🇮 Liechtenstein', labelRu: '🇱🇮 Лихтенштейн' },
  { value: 'LT', label: '🇱🇹 Lithuania', labelKa: '🇱🇹 ლიტვა', labelEn: '🇱🇹 Lithuania', labelRu: '🇱🇹 Литва' },
  { value: 'LU', label: '🇱🇺 Luxembourg', labelKa: '🇱🇺 ლუქსემბურგი', labelEn: '🇱🇺 Luxembourg', labelRu: '🇱🇺 Люксембург' },
  { value: 'MO', label: '🇲🇴 Macao', labelKa: '🇲🇴 მაკაო', labelEn: '🇲🇴 Macao', labelRu: '🇲🇴 Макао' },
  { value: 'MG', label: '🇲🇬 Madagascar', labelKa: '🇲🇬 მადაგასკარი', labelEn: '🇲🇬 Madagascar', labelRu: '🇲🇬 Мадагаскар' },
  { value: 'MW', label: '🇲🇼 Malawi', labelKa: '🇲🇼 მალავი', labelEn: '🇲🇼 Malawi', labelRu: '🇲🇼 Малави' },
  { value: 'MY', label: '🇲🇾 Malaysia', labelKa: '🇲🇾 მალაიზია', labelEn: '🇲🇾 Malaysia', labelRu: '🇲🇾 Малайзия' },
  { value: 'MV', label: '🇲🇻 Maldives', labelKa: '🇲🇻 მალდივები', labelEn: '🇲🇻 Maldives', labelRu: '🇲🇻 Мальдивы' },
  { value: 'ML', label: '🇲🇱 Mali', labelKa: '🇲🇱 მალი', labelEn: '🇲🇱 Mali', labelRu: '🇲🇱 Мали' },
  { value: 'MT', label: '🇲🇹 Malta', labelKa: '🇲🇹 მალტა', labelEn: '🇲🇹 Malta', labelRu: '🇲🇹 Мальта' },
  { value: 'MH', label: '🇲🇭 Marshall Islands', labelKa: '🇲🇭 მარშალის კუნძულები', labelEn: '🇲🇭 Marshall Islands', labelRu: '🇲🇭 Маршалловы Острова' },
  { value: 'MQ', label: '🇲🇶 Martinique', labelKa: '🇲🇶 მარტინიკა', labelEn: '🇲🇶 Martinique', labelRu: '🇲🇶 Мартиника' },
  { value: 'MR', label: '🇲🇷 Mauritania', labelKa: '🇲🇷 მავრიტანია', labelEn: '🇲🇷 Mauritania', labelRu: '🇲🇷 Мавритания' },
  { value: 'MU', label: '🇲🇺 Mauritius', labelKa: '🇲🇺 მავრიკია', labelEn: '🇲🇺 Mauritius', labelRu: '🇲🇺 Маврикий' },
  { value: 'YT', label: '🇾🇹 Mayotte', labelKa: '🇾🇹 მაიოტა', labelEn: '🇾🇹 Mayotte', labelRu: '🇾🇹 Майотта' },
  { value: 'MX', label: '🇲🇽 Mexico', labelKa: '🇲🇽 მექსიკა', labelEn: '🇲🇽 Mexico', labelRu: '🇲🇽 Мексика' },
  { value: 'FM', label: '🇫🇲 Micronesia', labelKa: '🇫🇲 მიკრონეზია', labelEn: '🇫🇲 Micronesia', labelRu: '🇫🇲 Микронезия' },
  { value: 'MD', label: '🇲🇩 Moldova', labelKa: '🇲🇩 მოლდოვა', labelEn: '🇲🇩 Moldova', labelRu: '🇲🇩 Молдова' },
  { value: 'MC', label: '🇲🇨 Monaco', labelKa: '🇲🇨 მონაკო', labelEn: '🇲🇨 Monaco', labelRu: '🇲🇨 Монако' },
  { value: 'MN', label: '🇲🇳 Mongolia', labelKa: '🇲🇳 მონღოლეთი', labelEn: '🇲🇳 Mongolia', labelRu: '🇲🇳 Монголия' },
  { value: 'ME', label: '🇲🇪 Montenegro', labelKa: '🇲🇪 მონტენეგრო', labelEn: '🇲🇪 Montenegro', labelRu: '🇲🇪 Черногория' },
  { value: 'MS', label: '🇲🇸 Montserrat', labelKa: '🇲🇸 მონსერატი', labelEn: '🇲🇸 Montserrat', labelRu: '🇲🇸 Монтсеррат' },
  { value: 'MA', label: '🇲🇦 Morocco', labelKa: '🇲🇦 მაროკო', labelEn: '🇲🇦 Morocco', labelRu: '🇲🇦 Марокко' },
  { value: 'MZ', label: '🇲🇿 Mozambique', labelKa: '🇲🇿 მოზამბიკი', labelEn: '🇲🇿 Mozambique', labelRu: '🇲🇿 Мозамбик' },
  { value: 'MM', label: '🇲🇲 Myanmar', labelKa: '🇲🇲 მიანმარი', labelEn: '🇲🇲 Myanmar', labelRu: '🇲🇲 Мьянма' },
  { value: 'NA', label: '🇳🇦 Namibia', labelKa: '🇳🇦 ნამიბია', labelEn: '🇳🇦 Namibia', labelRu: '🇳🇦 Намибия' },
  { value: 'NR', label: '🇳🇷 Nauru', labelKa: '🇳🇷 ნაურუ', labelEn: '🇳🇷 Nauru', labelRu: '🇳🇷 Науру' },
  { value: 'NP', label: '🇳🇵 Nepal', labelKa: '🇳🇵 ნეპალი', labelEn: '🇳🇵 Nepal', labelRu: '🇳🇵 Непал' },
  { value: 'NL', label: '🇳🇱 Netherlands', labelKa: '🇳🇱 ნიდერლანდები', labelEn: '🇳🇱 Netherlands', labelRu: '🇳🇱 Нидерланды' },
  { value: 'NC', label: '🇳🇨 New Caledonia', labelKa: '🇳🇨 ახალი კალედონია', labelEn: '🇳🇨 New Caledonia', labelRu: '🇳🇨 Новая Каледония' },
  { value: 'NZ', label: '🇳🇿 New Zealand', labelKa: '🇳🇿 ახალი ზელანდია', labelEn: '🇳🇿 New Zealand', labelRu: '🇳🇿 Новая Зеландия' },
  { value: 'NI', label: '🇳🇮 Nicaragua', labelKa: '🇳🇮 ნიკარაგუა', labelEn: '🇳🇮 Nicaragua', labelRu: '🇳🇮 Никарагуа' },
  { value: 'NE', label: '🇳🇪 Niger', labelKa: '🇳🇪 ნიგერი', labelEn: '🇳🇪 Niger', labelRu: '🇳🇪 Нигер' },
  { value: 'NG', label: '🇳🇬 Nigeria', labelKa: '🇳🇬 ნიგერია', labelEn: '🇳🇬 Nigeria', labelRu: '🇳🇬 Нигерия' },
  { value: 'NU', label: '🇳🇺 Niue', labelKa: '🇳🇺 ნიუე', labelEn: '🇳🇺 Niue', labelRu: '🇳🇺 Ниуэ' },
  { value: 'NF', label: '🇳🇫 Norfolk Island', labelKa: '🇳🇫 ნორფოლკის კუნძული', labelEn: '🇳🇫 Norfolk Island', labelRu: '🇳🇫 Остров Норфолк' },
  { value: 'MK', label: '🇲🇰 North Macedonia', labelKa: '🇲🇰 ჩრდილოეთ მაკედონია', labelEn: '🇲🇰 North Macedonia', labelRu: '🇲🇰 Северная Македония' },
  { value: 'MP', label: '🇲🇵 Northern Mariana Islands', labelKa: '🇲🇵 ჩრდილოეთ მარიანას კუნძულები', labelEn: '🇲🇵 Northern Mariana Islands', labelRu: '🇲🇵 Северные Марианские острова' },
  { value: 'NO', label: '🇳🇴 Norway', labelKa: '🇳🇴 ნორვეგია', labelEn: '🇳🇴 Norway', labelRu: '🇳🇴 Норвегия' },
  { value: 'OM', label: '🇴🇲 Oman', labelKa: '🇴🇲 ომანი', labelEn: '🇴🇲 Oman', labelRu: '🇴🇲 Оман' },
  { value: 'PK', label: '🇵🇰 Pakistan', labelKa: '🇵🇰 პაკისტანი', labelEn: '🇵🇰 Pakistan', labelRu: '🇵🇰 Пакистан' },
  { value: 'PW', label: '🇵🇼 Palau', labelKa: '🇵🇼 პალაუ', labelEn: '🇵🇼 Palau', labelRu: '🇵🇼 Палау' },
  { value: 'PS', label: '🇵🇸 Palestine', labelKa: '🇵🇸 პალესტინა', labelEn: '🇵🇸 Palestine', labelRu: '🇵🇸 Палестина' },
  { value: 'PA', label: '🇵🇦 Panama', labelKa: '🇵🇦 პანამა', labelEn: '🇵🇦 Panama', labelRu: '🇵🇦 Панама' },
  { value: 'PG', label: '🇵🇬 Papua New Guinea', labelKa: '🇵🇬 პაპუა-ახალი გვინეა', labelEn: '🇵🇬 Papua New Guinea', labelRu: '🇵🇬 Папуа — Новая Гвинея' },
  { value: 'PY', label: '🇵🇾 Paraguay', labelKa: '🇵🇾 პარაგვაი', labelEn: '🇵🇾 Paraguay', labelRu: '🇵🇾 Парагвай' },
  { value: 'PE', label: '🇵🇪 Peru', labelKa: '🇵🇪 პერუ', labelEn: '🇵🇪 Peru', labelRu: '🇵🇪 Перу' },
  { value: 'PH', label: '🇵🇭 Philippines', labelKa: '🇵🇭 ფილიპინები', labelEn: '🇵🇭 Philippines', labelRu: '🇵🇭 Филиппины' },
  { value: 'PN', label: '🇵🇳 Pitcairn', labelKa: '🇵🇳 პიტკერნის კუნძულები', labelEn: '🇵🇳 Pitcairn', labelRu: '🇵🇳 Острова Питкэрн' },
  { value: 'PL', label: '🇵🇱 Poland', labelKa: '🇵🇱 პოლონეთი', labelEn: '🇵🇱 Poland', labelRu: '🇵🇱 Польша' },
  { value: 'PT', label: '🇵🇹 Portugal', labelKa: '🇵🇹 პორტუგალია', labelEn: '🇵🇹 Portugal', labelRu: '🇵🇹 Португалия' },
  { value: 'PR', label: '🇵🇷 Puerto Rico', labelKa: '🇵🇷 პუერტო-რიკო', labelEn: '🇵🇷 Puerto Rico', labelRu: '🇵🇷 Пуэрто-Рико' },
  { value: 'QA', label: '🇶🇦 Qatar', labelKa: '🇶🇦 ყატარი', labelEn: '🇶🇦 Qatar', labelRu: '🇶🇦 Катар' },
  { value: 'RE', label: '🇷🇪 Réunion', labelKa: '🇷🇪 რეუნიონი', labelEn: '🇷🇪 Réunion', labelRu: '🇷🇪 Реюньон' },
  { value: 'RO', label: '🇷🇴 Romania', labelKa: '🇷🇴 რუმინეთი', labelEn: '🇷🇴 Romania', labelRu: '🇷🇴 Румыния' },
  { value: 'RU', label: '🇷🇺 Russia', labelKa: '🇷🇺 რუსეთი', labelEn: '🇷🇺 Russia', labelRu: '🇷🇺 Россия' },
  { value: 'RW', label: '🇷🇼 Rwanda', labelKa: '🇷🇼 რუანდა', labelEn: '🇷🇼 Rwanda', labelRu: '🇷🇼 Руанда' },
  { value: 'BL', label: '🇧🇱 Saint Barthélemy', labelKa: '🇧🇱 სენ-ბართელმი', labelEn: '🇧🇱 Saint Barthélemy', labelRu: '🇧🇱 Сен-Бартелеми' },
  { value: 'SH', label: '🇸🇭 Saint Helena', labelKa: '🇸🇭 წმინდა ელენეს კუნძული', labelEn: '🇸🇭 Saint Helena', labelRu: '🇸🇭 Остров Святой Елены' },
  { value: 'KN', label: '🇰🇳 Saint Kitts and Nevis', labelKa: '🇰🇳 სენტ-კიტსი და ნევისი', labelEn: '🇰🇳 Saint Kitts and Nevis', labelRu: '🇰🇳 Сент-Китс и Невис' },
  { value: 'LC', label: '🇱🇨 Saint Lucia', labelKa: '🇱🇨 სენტ-ლუსია', labelEn: '🇱🇨 Saint Lucia', labelRu: '🇱🇨 Сент-Люсия' },
  { value: 'MF', label: '🇲🇫 Saint Martin', labelKa: '🇲🇫 სენ-მარტენი', labelEn: '🇲🇫 Saint Martin', labelRu: '🇲🇫 Сен-Мартен' },
  { value: 'PM', label: '🇵🇲 Saint Pierre and Miquelon', labelKa: '🇵🇲 სენ-პიერი და მიკელონი', labelEn: '🇵🇲 Saint Pierre and Miquelon', labelRu: '🇵🇲 Сен-Пьер и Микелон' },
  { value: 'VC', label: '🇻🇨 Saint Vincent and the Grenadines', labelKa: '🇻🇨 სენტ-ვინსენტი და გრენადინები', labelEn: '🇻🇨 Saint Vincent and the Grenadines', labelRu: '🇻🇨 Сент-Винсент и Гренадины' },
  { value: 'WS', label: '🇼🇸 Samoa', labelKa: '🇼🇸 სამოა', labelEn: '🇼🇸 Samoa', labelRu: '🇼🇸 Самоа' },
  { value: 'SM', label: '🇸🇲 San Marino', labelKa: '🇸🇲 სან-მარინო', labelEn: '🇸🇲 San Marino', labelRu: '🇸🇲 Сан-Марино' },
  { value: 'ST', label: '🇸🇹 Sao Tome and Principe', labelKa: '🇸🇹 სან-ტომე და პრინსიპი', labelEn: '🇸🇹 Sao Tome and Principe', labelRu: '🇸🇹 Сан-Томе и Принсипи' },
  { value: 'SA', label: '🇸🇦 Saudi Arabia', labelKa: '🇸🇦 საუდის არაბეთი', labelEn: '🇸🇦 Saudi Arabia', labelRu: '🇸🇦 Саудовская Аравия' },
  { value: 'SN', label: '🇸🇳 Senegal', labelKa: '🇸🇳 სენეგალი', labelEn: '🇸🇳 Senegal', labelRu: '🇸🇳 Сенегал' },
  { value: 'RS', label: '🇷🇸 Serbia', labelKa: '🇷🇸 სერბეთი', labelEn: '🇷🇸 Serbia', labelRu: '🇷🇸 Сербия' },
  { value: 'SC', label: '🇸🇨 Seychelles', labelKa: '🇸🇨 სეიშელის კუნძულები', labelEn: '🇸🇨 Seychelles', labelRu: '🇸🇨 Сейшельские Острова' },
  { value: 'SL', label: '🇸🇱 Sierra Leone', labelKa: '🇸🇱 სიერა-ლეონე', labelEn: '🇸🇱 Sierra Leone', labelRu: '🇸🇱 Сьерра-Леоне' },
  { value: 'SG', label: '🇸🇬 Singapore', labelKa: '🇸🇬 სინგაპური', labelEn: '🇸🇬 Singapore', labelRu: '🇸🇬 Сингапур' },
  { value: 'SX', label: '🇸🇽 Sint Maarten', labelKa: '🇸🇽 სინტ-მარტენი', labelEn: '🇸🇽 Sint Maarten', labelRu: '🇸🇽 Синт-Мартен' },
  { value: 'SK', label: '🇸🇰 Slovakia', labelKa: '🇸🇰 სლოვაკეთი', labelEn: '🇸🇰 Slovakia', labelRu: '🇸🇰 Словакия' },
  { value: 'SI', label: '🇸🇮 Slovenia', labelKa: '🇸🇮 სლოვენია', labelEn: '🇸🇮 Slovenia', labelRu: '🇸🇮 Словения' },
  { value: 'SB', label: '🇸🇧 Solomon Islands', labelKa: '🇸🇧 სოლომონის კუნძულები', labelEn: '🇸🇧 Solomon Islands', labelRu: '🇸🇧 Соломоновы Острова' },
  { value: 'SO', label: '🇸🇴 Somalia', labelKa: '🇸🇴 სომალი', labelEn: '🇸🇴 Somalia', labelRu: '🇸🇴 Сомали' },
  { value: 'ZA', label: '🇿🇦 South Africa', labelKa: '🇿🇦 სამხრეთ აფრიკა', labelEn: '🇿🇦 South Africa', labelRu: '🇿🇦 ЮАР' },
  { value: 'GS', label: '🇬🇸 South Georgia and the South Sandwich Islands', labelKa: '🇬🇸 სამხრეთ ჯორჯია და სამხრეთ სენდვიჩის კუნძულები', labelEn: '🇬🇸 South Georgia and the South Sandwich Islands', labelRu: '🇬🇸 Южная Георгия и Южные Сандвичевы Острова' },
  { value: 'SS', label: '🇸🇸 South Sudan', labelKa: '🇸🇸 სამხრეთ სუდანი', labelEn: '🇸🇸 South Sudan', labelRu: '🇸🇸 Южный Судан' },
  { value: 'ES', label: '🇪🇸 Spain', labelKa: '🇪🇸 ესპანეთი', labelEn: '🇪🇸 Spain', labelRu: '🇪🇸 Испания' },
  { value: 'LK', label: '🇱🇰 Sri Lanka', labelKa: '🇱🇰 შრი-ლანკა', labelEn: '🇱🇰 Sri Lanka', labelRu: '🇱🇰 Шри-Ланка' },
  { value: 'SD', label: '🇸🇩 Sudan', labelKa: '🇸🇩 სუდანი', labelEn: '🇸🇩 Sudan', labelRu: '🇸🇩 Судан' },
  { value: 'SR', label: '🇸🇷 Suriname', labelKa: '🇸🇷 სურინამი', labelEn: '🇸🇷 Suriname', labelRu: '🇸🇷 Суринам' },
  { value: 'SJ', label: '🇸🇯 Svalbard and Jan Mayen', labelKa: '🇸🇯 შპიცბერგენი და იან-მაიენი', labelEn: '🇸🇯 Svalbard and Jan Mayen', labelRu: '🇸🇯 Шпицберген и Ян-Майен' },
  { value: 'SE', label: '🇸🇪 Sweden', labelKa: '🇸🇪 შვედეთი', labelEn: '🇸🇪 Sweden', labelRu: '🇸🇪 Швеция' },
  { value: 'CH', label: '🇨🇭 Switzerland', labelKa: '🇨🇭 შვეიცარია', labelEn: '🇨🇭 Switzerland', labelRu: '🇨🇭 Швейцария' },
  { value: 'SY', label: '🇸🇾 Syria', labelKa: '🇸🇾 სირია', labelEn: '🇸🇾 Syria', labelRu: '🇸🇾 Сирия' },
  { value: 'TW', label: '🇹🇼 Taiwan', labelKa: '🇹🇼 ტაივანი', labelEn: '🇹🇼 Taiwan', labelRu: '🇹🇼 Тайвань' },
  { value: 'TJ', label: '🇹🇯 Tajikistan', labelKa: '🇹🇯 ტაჯიკეთი', labelEn: '🇹🇯 Tajikistan', labelRu: '🇹🇯 Таджикистан' },
  { value: 'TZ', label: '🇹🇿 Tanzania', labelKa: '🇹🇿 ტანზანია', labelEn: '🇹🇿 Tanzania', labelRu: '🇹🇿 Танзания' },
  { value: 'TH', label: '🇹🇭 Thailand', labelKa: '🇹🇭 ტაილანდი', labelEn: '🇹🇭 Thailand', labelRu: '🇹🇭 Таиланд' },
  { value: 'TL', label: '🇹🇱 Timor-Leste', labelKa: '🇹🇱 აღმოსავლეთ ტიმორი', labelEn: '🇹🇱 Timor-Leste', labelRu: '🇹🇱 Восточный Тимор' },
  { value: 'TG', label: '🇹🇬 Togo', labelKa: '🇹🇬 ტოგო', labelEn: '🇹🇬 Togo', labelRu: '🇹🇬 Того' },
  { value: 'TK', label: '🇹🇰 Tokelau', labelKa: '🇹🇰 ტოკელაუ', labelEn: '🇹🇰 Tokelau', labelRu: '🇹🇰 Токелау' },
  { value: 'TO', label: '🇹🇴 Tonga', labelKa: '🇹🇴 ტონგა', labelEn: '🇹🇴 Tonga', labelRu: '🇹🇴 Тонга' },
  { value: 'TT', label: '🇹🇹 Trinidad and Tobago', labelKa: '🇹🇹 ტრინიდადი და ტობაგო', labelEn: '🇹🇹 Trinidad and Tobago', labelRu: '🇹🇹 Тринидад и Тобаго' },
  { value: 'TN', label: '🇹🇳 Tunisia', labelKa: '🇹🇳 ტუნისი', labelEn: '🇹🇳 Tunisia', labelRu: '🇹🇳 Тунис' },
  { value: 'TR', label: '🇹🇷 Turkey', labelKa: '🇹🇷 თურქეთი', labelEn: '🇹🇷 Turkey', labelRu: '🇹🇷 Турция' },
  { value: 'TM', label: '🇹🇲 Turkmenistan', labelKa: '🇹🇲 თურქმენეთი', labelEn: '🇹🇲 Turkmenistan', labelRu: '🇹🇲 Туркменистан' },
  { value: 'TC', label: '🇹🇨 Turks and Caicos Islands', labelKa: '🇹🇨 თერქს-ქაიქოსის კუნძულები', labelEn: '🇹🇨 Turks and Caicos Islands', labelRu: '🇹🇨 Острова Теркс и Кайкос' },
  { value: 'TV', label: '🇹🇻 Tuvalu', labelKa: '🇹🇻 ტუვალუ', labelEn: '🇹🇻 Tuvalu', labelRu: '🇹🇻 Тувалу' },
  { value: 'UG', label: '🇺🇬 Uganda', labelKa: '🇺🇬 უგანდა', labelEn: '🇺🇬 Uganda', labelRu: '🇺🇬 Уганда' },
  { value: 'UA', label: '🇺🇦 Ukraine', labelKa: '🇺🇦 უკრაინა', labelEn: '🇺🇦 Ukraine', labelRu: '🇺🇦 Украина' },
  { value: 'AE', label: '🇦🇪 United Arab Emirates', labelKa: '🇦🇪 არაბეთის გაერთიანებული საამიროები', labelEn: '🇦🇪 United Arab Emirates', labelRu: '🇦🇪 ОАЭ' },
  { value: 'GB', label: '🇬🇧 United Kingdom', labelKa: '🇬🇧 გაერთიანებული სამეფო', labelEn: '🇬🇧 United Kingdom', labelRu: '🇬🇧 Великобритания' },
  { value: 'US', label: '🇺🇸 United States', labelKa: '🇺🇸 ამერიკის შეერთებული შტატები', labelEn: '🇺🇸 United States', labelRu: '🇺🇸 США' },
  { value: 'UM', label: '🇺🇲 United States Minor Outlying Islands', labelKa: '🇺🇲 აშშ-ის მცირე დაშორებული კუნძულები', labelEn: '🇺🇲 United States Minor Outlying Islands', labelRu: '🇺🇲 Внешние малые острова США' },
  { value: 'UY', label: '🇺🇾 Uruguay', labelKa: '🇺🇾 ურუგვაი', labelEn: '🇺🇾 Uruguay', labelRu: '🇺🇾 Уругвай' },
  { value: 'UZ', label: '🇺🇿 Uzbekistan', labelKa: '🇺🇿 უზბეკეთი', labelEn: '🇺🇿 Uzbekistan', labelRu: '🇺🇿 Узбекистан' },
  { value: 'VU', label: '🇻🇺 Vanuatu', labelKa: '🇻🇺 ვანუატუ', labelEn: '🇻🇺 Vanuatu', labelRu: '🇻🇺 Вануату' },
  { value: 'VE', label: '🇻🇪 Venezuela', labelKa: '🇻🇪 ვენესუელა', labelEn: '🇻🇪 Venezuela', labelRu: '🇻🇪 Венесуэла' },
  { value: 'VN', label: '🇻🇳 Vietnam', labelKa: '🇻🇳 ვიეტნამი', labelEn: '🇻🇳 Vietnam', labelRu: '🇻🇳 Вьетнам' },
  { value: 'VG', label: '🇻🇬 Virgin Islands (British)', labelKa: '🇻🇬 ვირჯინის კუნძულები (ბრიტანეთი)', labelEn: '🇻🇬 Virgin Islands (British)', labelRu: '🇻🇬 Виргинские Острова (Великобритания)' },
  { value: 'VI', label: '🇻🇮 Virgin Islands (U.S.)', labelKa: '🇻🇮 ვირჯინის კუნძულები (აშშ)', labelEn: '🇻🇮 Virgin Islands (U.S.)', labelRu: '🇻🇮 Виргинские Острова (США)' },
  { value: 'WF', label: '🇼🇫 Wallis and Futuna', labelKa: '🇼🇫 უოლისი და ფუტუნა', labelEn: '🇼🇫 Wallis and Futuna', labelRu: '🇼🇫 Уоллис и Футуна' },
  { value: 'EH', label: '🇪🇭 Western Sahara', labelKa: '🇪🇭 დასავლეთ საჰარა', labelEn: '🇪🇭 Western Sahara', labelRu: '🇪🇭 Западная Сахара' },
  { value: 'YE', label: '🇾🇪 Yemen', labelKa: '🇾🇪 იემენი', labelEn: '🇾🇪 Yemen', labelRu: '🇾🇪 Йемен' },
  { value: 'ZM', label: '🇿🇲 Zambia', labelKa: '🇿🇲 ზამბია', labelEn: '🇿🇲 Zambia', labelRu: '🇿🇲 Замбия' },
  { value: 'ZW', label: '🇿🇼 Zimbabwe', labelKa: '🇿🇼 ზიმბაბვე', labelEn: '🇿🇼 Zimbabwe', labelRu: '🇿🇼 Зимбабве' },
];

/**
 * CitizenshipSelect - Searchable country selector with 250 countries
 *
 * Features:
 * - 250 countries and territories (ISO 3166-1 alpha-2)
 * - Multilingual support (Georgian, English, Russian)
 * - Country flag emojis
 * - Searchable dropdown
 * - Default value: 'GE' (Georgia)
 *
 * Usage:
 * ```tsx
 * <CitizenshipSelect
 *   value={citizenship}
 *   onChange={(value) => setCitizenship(value)}
 *   required
 * />
 * ```
 * @param root0
 * @param root0.value
 * @param root0.onChange
 * @param root0.label
 * @param root0.error
 * @param root0.required
 */
export function CitizenshipSelect({ value, onChange, label, error, required }: CitizenshipSelectProps) {
  const { t, lang } = useTranslation();

  // Get localized country data based on current language
  const getLocalizedCountries = () => {
    return countries.map((country) => ({
      value: country.value,
      label: lang === 'ka' ? country.labelKa : lang === 'ru' ? country.labelRu : country.labelEn,
    }));
  };

  return (
    <EMRSelect
      label={label || t('registration.field.citizenship')}
      placeholder={t('registration.patient.citizenship.placeholder') || 'აირჩიეთ მოქალაქეობა'}
      data={getLocalizedCountries()}
      value={value}
      onChange={(val) => onChange(val || 'GE')}
      error={error}
      required={required}
      searchable
      clearable
      nothingFoundMessage={t('registration.patient.citizenship.noResults') || 'ვერ მოიძებნა'}
      maxDropdownHeight={300}
    />
  );
}
