﻿/**
Провайдер AnyBalance (http://any-balance-providers.googlecode.com)
*/

var g_headers = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Accept-Charset': 'windows-1251,utf-8;q=0.7,*;q=0.3',
	'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
	'Connection': 'keep-alive',
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.76 Safari/537.36',
};

function main() {
	var prefs = AnyBalance.getPreferences();
	var baseurl = 'https://bonus.vtb24.ru/';
	AnyBalance.setDefaultCharset('utf-8');
	
	checkEmpty(/\d{10}/i.test(prefs.login), 'Введите номер телефона, 10 цифр подряд!');
	checkEmpty(prefs.password, 'Введите пароль!');
	
	prefs.login = getParam(prefs.login, null, null, null, [/(\d{3})(\d{3})(\d{4})/, '+7 ($1) $2-$3']);
	
	var html = AnyBalance.requestGet(baseurl + 'account/login', g_headers);
	
	html = AnyBalance.requestPost(baseurl + 'account/login', {
		Phone: prefs.login,
		Password: prefs.password,
		'ReturnUrl': ''
	}, addHeaders({Referer: baseurl + 'account/login'}));
	
	if (!/logout/i.test(html)) {
		var error = getParam(html, null, null, /<div[^>]+class="t-error"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i, replaceTagsAndSpaces, html_entity_decode);
		if (error)
			throw new AnyBalance.Error(error, null, /Неверный логин или пароль/i.test(error));
		
		AnyBalance.trace(html);
		throw new AnyBalance.Error('Не удалось зайти в личный кабинет. Сайт изменен?');
	}
	
	html = AnyBalance.requestGet(baseurl + 'mypoints', g_headers);
	
	var result = {success: true};
	
	getParam(html, result, 'balance', /Бонусов получено(?:[\s\S]*?<td[^>]*>\s*<span[^>]*>){1}([^<]+)/i, replaceTagsAndSpaces, parseBalance);
	getParam(html, result, 'balance_payed', /Бонусов потрачено(?:[\s\S]*?<td[^>]*>\s*<span[^>]*>){2}([^<]+)/i, replaceTagsAndSpaces, parseBalance);
	
	AnyBalance.setResult(result);
}