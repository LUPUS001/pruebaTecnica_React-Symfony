-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 30-04-2026 a las 15:19:00
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `libreria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `book`
--

CREATE TABLE `book` (
  `id` int(11) NOT NULL,
  `isbn` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `author` varchar(255) NOT NULL,
  `published` datetime NOT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `pages` int(11) NOT NULL,
  `description` longtext DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `owner_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `book`
--

INSERT INTO `book` (`id`, `isbn`, `title`, `subtitle`, `author`, `published`, `publisher`, `pages`, `description`, `website`, `category`, `owner_id`) VALUES
(313, '9781593275846', 'Eloquent JavaScript, Second Edition', 'A Modern Introduction to Programming', 'Marijn Haverbeke', '2014-12-14 00:00:00', 'No Starch Press', 472, 'JavaScript lies at the heart of almost every modern web application, from social apps to the newest browser-based games. Though simple for beginners to pick up and play with, JavaScript is a flexible, complex language that you can use to build full-scale applications.', 'http://eloquentjavascript.net/', 'Classic', NULL),
(314, '9781449331818', 'Learning JavaScript Design Patterns', 'A JavaScript and jQuery Developer\'s Guide', 'Addy Osmani', '2012-07-01 00:00:00', 'O\'Reilly Media', 255, 'With Learning JavaScript Design Patterns, you\'ll learn how to write beautiful, structured, and maintainable JavaScript by applying classical and modern design patterns to the language. If you want to keep your code efficient, more manageable, and up-to-date with the latest best practices, this book is for you.', 'http://www.addyosmani.com/resources/essentialjsdesignpatterns/book/', 'Fantasy', NULL),
(316, '9781491950296', 'Programming JavaScript Applications', 'Robust Web Architecture with Node, HTML5, and Modern JS Libraries', 'Eric Elliott', '2014-07-01 00:00:00', 'O\'Reilly Media', 254, 'Take advantage of JavaScript\'s power to build robust web-scale or enterprise applications that are easy to extend and maintain. By applying the design patterns outlined in this practical book, experienced JavaScript developers will learn how to write flexible and resilient code that\'s easier-yes, easier-to work with as your code base grows.', 'http://chimera.labs.oreilly.com/books/1234000000262/index.html', 'Drama', NULL),
(317, '9781593277574', 'Understanding ECMAScript 6', 'The Definitive Guide for JavaScript Developers', 'Nicholas C. Zakas', '2016-09-03 00:00:00', 'No Starch Press', 352, 'ECMAScript 6 represents the biggest update to the core of JavaScript in the history of the language. In Understanding ECMAScript 6, expert developer Nicholas C. Zakas provides a complete guide to the object types, syntax, and other exciting changes that ECMAScript 6 brings to JavaScript.', 'https://leanpub.com/understandinges6/read', 'Suspense', NULL),
(318, '9781491904244', 'You Don\'t Know JS', 'ES6 & Beyond', 'Kyle Simpson', '2015-12-27 00:00:00', 'O\'Reilly Media', 278, 'No matter how much experience you have with JavaScript, odds are you don’t fully understand the language. As part of the \"You Don’t Know JS\" series, this compact guide focuses on new features available in ECMAScript 6 (ES6), the latest version of the standard upon which JavaScript is built.', 'https://github.com/getify/You-Dont-Know-JS/tree/master/es6%20&%20beyond', 'Drama', NULL),
(319, '9781449325862', 'Git Pocket Guide', 'A Working Introduction', 'Richard E. Silverman', '2013-08-02 00:00:00', 'O\'Reilly Media', 234, 'This pocket guide is the perfect on-the-job companion to Git, the distributed version control system. It provides a compact, readable introduction to Git for new users, as well as a reference to common commands and procedures for those of you with Git experience.', 'http://chimera.labs.oreilly.com/books/1230000000561/index.html', 'Classic', NULL),
(320, '9781449337711', 'Designing Evolvable Web APIs with ASP.NET', 'Harnessing the Power of the Web', 'Glenn Block, et al.', '2014-04-07 00:00:00', 'O\'Reilly Media', 538, 'Design and build Web APIs for a broad range of clients—including browsers and mobile devices—that can adapt to change over time. This practical, hands-on guide takes you through the theory and tools you need to build evolvable HTTP services with Microsoft’s ASP.NET Web API framework. In the process, you’ll learn how design and implement a real-world Web API.', 'http://chimera.labs.oreilly.com/books/1234000001708/index.html', 'Suspense', NULL),
(337, '9780140439199', 'El arte de la guerra', NULL, 'Sun Tzu', '2026-04-16 00:00:00', NULL, 832, '\"El arte de la guerra\" es un antiguo tratado militar chino del siglo V a.C., atribuido a Sun Tzu, que detalla estrategias para ganar conflictos mediante la inteligencia, la planificación y la adaptabilidad, sin depender exclusivamente de la violencia.', NULL, 'Politico', NULL),
(343, '6643543666', 'Berserk', NULL, 'Kentaro Miura', '1980-04-09 00:00:00', NULL, 1002, NULL, NULL, 'Dark fantasy', NULL),
(344, '100001', 'Gintama', NULL, 'Kinchan', '2026-04-17 00:00:00', NULL, 1000, NULL, NULL, 'Slice of life', NULL),
(366, '9781234567897', 'Boku no Hero', NULL, 'Kohei Horikoshi', '2013-02-13 00:00:00', NULL, 812, NULL, NULL, 'Shonen', NULL),
(387, '9781449365035', 'Speaking JavaScript', 'An In-Depth Guide for Programmers', 'Axel Rauschmayer', '2014-02-01 00:00:00', 'O\'Reilly Media', 460, 'Like it or not, JavaScript is everywhere these days-from browser to server to mobile-and now you, too, need to learn the language or dive deeper than you have. This concise book guides you into and through JavaScript, written by a veteran programmer who once found himself in the same position.', 'http://speakingjs.com/', 'Fantasy', NULL),
(388, '9780000109828', 'El Enigma de la Constelación', 'Un viaje literario único por el género de drama', 'Stephen King', '2021-01-08 23:00:00', 'Penguin Classics', 459, 'Descubre la fascinante historia de \"El Enigma de la Constelación\". Una obra maestra de Stephen King que te mantendrá atrapado desde la primera página. Publicado por Penguin Classics.', 'https://biblioteca-ejemplo.com/libros/9780000109828', 'Drama', NULL),
(389, '9780000002143', 'Crónicas del Mañana', 'Un viaje literario único por el género de terror', 'Agatha Christie', '2004-07-23 22:00:00', 'Penguin Classics', 398, 'Descubre la fascinante historia de \"Crónicas del Mañana\". Una obra maestra de Agatha Christie que te mantendrá atrapado desde la primera página. Publicado por Penguin Classics.', 'https://biblioteca-ejemplo.com/libros/9780000002143', 'Terror', NULL),
(390, '9788499897134', 'Monster', NULL, 'Naoki Urasawa', '1994-12-07 00:00:00', NULL, 815, 'Este manga trata sobre un doctor el cuál se ve en una situación muy comprometida en la que doctor tiene que decidir que vida salvar si la de un político que ayudaría en su carrera o la de un niño aparentemente \"inocente\".', NULL, 'Psicologico', 1),
(391, '978-8498471410', 'Air Gear', NULL, 'Oh Great', '2002-12-06 00:00:00', NULL, 457, NULL, NULL, 'Shonen', 2),
(392, '978-84-450-0067-0', 'El Hobbit', NULL, 'J. R. R. Tolkien', '1937-09-21 00:00:00', NULL, 1021, NULL, NULL, 'Fantasia', 2),
(395, '9789999990011', 'Las Sombras del Pasado', 'Un viaje literario único por el género de fantasía', 'Agatha Christie', '2007-02-28 23:00:00', 'Planeta', 150, 'Descubre la fascinante historia de \"Las Sombras del Pasado\". Una obra maestra de Agatha Christie que te mantendrá atrapado desde la primera página. Publicado por Planeta.', 'https://biblioteca-ejemplo.com/libros/9780000368990', 'Fantasía', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20260318132249', '2026-03-18 13:23:01', 56),
('DoctrineMigrations\\Version20260420070811', '2026-04-20 07:08:27', 92),
('DoctrineMigrations\\Version20260423062341', '2026-04-23 06:23:58', 14),
('DoctrineMigrations\\Version20260423143203', '2026-04-23 14:32:03', 68);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `image`
--

CREATE TABLE `image` (
  `id` int(11) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `book_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `image`
--

INSERT INTO `image` (`id`, `ruta_archivo`, `book_id`) VALUES
(243, '/images/9781593275846.jpg', 313),
(244, '/images/9781593275846_2.jpg', 313),
(245, '/images/9781449331818.jpg', 314),
(246, '/images/9781449331818_2.jpeg', 314),
(248, '/images/9781491950296.jpg', 316),
(249, '/images/9781491950296_2.jpg', 316),
(250, '/images/9781593277574.png', 317),
(251, '/images/9781491904244.jpg', 318),
(252, '/images/9781449325862.jpg', 319),
(253, '/images/9781449337711.png', 320),
(255, '/images/1110003.webp', 337),
(261, '/images/6643543666.jpg', 343),
(266, '/images/100001.webp', 344),
(268, '/images/9781234567897-69e719b0aa4d0.jpg', 366),
(269, '/images/9781234567897-69e719b0aa6c8.jpg', 366),
(270, '/images/9781234567897-69e719b0aa78d.jpg', 366),
(271, '/images/9781449365035.jpg', 387),
(272, '/images/978-8498471410-69eb0cf254d44.jpg', 391),
(273, '/images/978-8498471410-69eb0cf254ef6.jpg', 391),
(274, '/images/978-8498471410-69eb0cf254fa1.jpg', 391),
(275, '/images/978-84-450-0067-0-69eb11683d793.jpg', 392),
(276, '/images/978-84-450-0067-0-69eb11683d9cc.webp', 392),
(277, '/images/978-84-450-0067-0-69eb11683dbe8.webp', 392),
(278, '/images/9780140439199-69f0553e73bd9.jpg', 337),
(281, '/images/9788499897134-69f21c0498817.webp', 390),
(282, '/images/9788499897134-69f21c0498c1d.jpg', 390);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `messenger_messages`
--

CREATE TABLE `messenger_messages` (
  `id` bigint(20) NOT NULL,
  `body` longtext NOT NULL,
  `headers` longtext NOT NULL,
  `queue_name` varchar(190) NOT NULL,
  `created_at` datetime NOT NULL,
  `available_at` datetime NOT NULL,
  `delivered_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(180) NOT NULL,
  `roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`roles`)),
  `password` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `email`, `roles`, `password`, `photo`, `description`) VALUES
(1, 'antonio@a.com', '[\"ROLE_USER\", \"ROLE_ADMIN\"]', '$2y$13$VPLPmUIr6w7s4BcyLR0o/OotRTvbF2OOkh1KszaAQZ6Wwkd3cmP6C', NULL, NULL),
(2, 'r@a.com', '[\"ROLE_USER\"]', '$2y$13$uHORP46krEXXxjLlBcz1NuGpogmOH00zGEmbRYP3E.rKhxZy.KZF2', NULL, NULL),
(3, 'aaron@ioel.com', '[\"ROLE_USER\"]', '$2y$13$30Ca5h8lbDYuptBXrOEFveG8ypZfeDAzOcqH8dq6xHvfbPYbT42Ha', NULL, NULL),
(4, 'torz@ioel.com', '[\"ROLE_USER\"]', '$2y$13$Vwf1g0ZfRUOoMz6uu3bUUOR9FOfFDifhh2ibISiOh3TdnnA0U9Agm', '/uploads/profiles/69ef086862448.webp', 'Me encanta este tipo de'),
(5, 'aar@a.com', '[\"ROLE_USER\"]', '$2y$13$r46JPsU5QuTdvi3Vca3Z8.BxraRCTELmGSODQAJT9f1djim/OUqHi', '/uploads/profiles/69ef09249a096.webp', 'Me encanta Rocket League'),
(7, 'b@b.com', '[\"ROLE_USER\"]', '$2y$13$Z7NOE14UCRZFwANNmzL/W.KDc.2Mc1yjcQ7SQL8Hop8mKZ7SQ4sI6', '/uploads/profiles/69ef086862448.webp', 'Un amante de...');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `book`
--
ALTER TABLE `book`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_CBE5A331CC1CF4E6` (`isbn`),
  ADD KEY `IDX_CBE5A3317E3C61F9` (`owner_id`);

--
-- Indices de la tabla `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Indices de la tabla `image`
--
ALTER TABLE `image`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_C53D045F16A2B381` (`book_id`);

--
-- Indices de la tabla `messenger_messages`
--
ALTER TABLE `messenger_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750` (`queue_name`,`available_at`,`delivered_at`,`id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_IDENTIFIER_EMAIL` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `book`
--
ALTER TABLE `book`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=428;

--
-- AUTO_INCREMENT de la tabla `image`
--
ALTER TABLE `image`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=283;

--
-- AUTO_INCREMENT de la tabla `messenger_messages`
--
ALTER TABLE `messenger_messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `book`
--
ALTER TABLE `book`
  ADD CONSTRAINT `FK_CBE5A3317E3C61F9` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`);

--
-- Filtros para la tabla `image`
--
ALTER TABLE `image`
  ADD CONSTRAINT `FK_C53D045F16A2B381` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
