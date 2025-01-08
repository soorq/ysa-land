<?php
$name = filter_input(INPUT_POST, "name", FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, "email", FILTER_SANITIZE_EMAIL);
$tel = filter_input(INPUT_POST, "tel", FILTER_SANITIZE_STRING);
$comp = filter_input(INPUT_POST, "comp", FILTER_SANITIZE_STRING);
$pos = filter_input(INPUT_POST, "pos", FILTER_SANITIZE_STRING);
$site = filter_input(INPUT_SERVER, "HTTP_HOST", FILTER_SANITIZE_STRING);
$protocol = filter_input(INPUT_SERVER, "SERVER_PROTOCOL") ?: "HTTP/1.0";
$time = date(DATE_RFC822);

if (empty($name) || empty($email) || empty($tel)) {
    header($protocol . " 400 Bad Request");
    die("Incorrect form data.");
}

$to = "info@yoursportagent.ru";
$subj = "Письмо от $name с сайта $site";
$message = "
<html>
<head>
  <title>Письмо от $name с сайта $site</title>
</head>
<body><font style=\"font-family: Verdana; font-size: 12px; color: black\">
Здравствуйте!
<br/><br/>
Пришло письмо от пользователя.
<br/><br/>
Имя: <b>$name</b><br/>
Email: <b>$email</b><br/>
Телефон: <b>$tel</b><br/>
Компания: <b>$comp</b><br/>
Должность: <b>$pos</b><br/>
Время отправки: <b>$time</b>
</body>
</html>
";

$headers = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
$headers .= 'From: info@yoursportagent.ru' . "\r\n";

mail($to, $subj, $message, $headers);

$filename = "report.csv";
$head = "\"Имя\";\"Компания\";\"Email\";\"Телефон\";\"Должность\";\"Время\";\"Сайт\"";
$content = "\"$name\";\"$comp\";\"$email\";\"$tel\";\"$pos\";\"$time\";\"$site\"" . "\r\n";

if(!file_exists($filename)) {
    $content = $head . "\r\n" . $content;
}

file_put_contents($filename, $content, FILE_APPEND);

echo 'Message was successfully sent.';
