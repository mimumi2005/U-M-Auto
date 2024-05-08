-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: carrepairshop
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrators`
--

DROP TABLE IF EXISTS `administrators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrators` (
  `idUser` int NOT NULL,
  `AdminTenure` int DEFAULT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrators`
--

LOCK TABLES `administrators` WRITE;
/*!40000 ALTER TABLE `administrators` DISABLE KEYS */;
INSERT INTO `administrators` VALUES (1,NULL);
/*!40000 ALTER TABLE `administrators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `idProjects` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `StartDate` varchar(45) DEFAULT NULL,
  `EndDateProjection` varchar(45) DEFAULT NULL,
  `Delayed` tinyint DEFAULT '0',
  `ProjectInfo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idProjects`),
  KEY `idUser_idx` (`idUser`),
  CONSTRAINT `user` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,1,'2024-04-22T07:00:00.000Z','2024-04-30T19:20:00.000Z',0,'Just an oil change'),(2,1,'2024-04-22T06:00:00.000Z','2024-10-29T12:00:00.000Z',0,'I want my whole car repainted in red.'),(3,1,'2024-04-11T06:00:00.000Z','2024-04-30T18:32:00.000Z',0,'Need this specific part 40094200'),(4,1,'2024-04-17T06:00:00.000Z','2024-04-17T07:00:00.000Z',NULL,'Have a car project that i want made.'),(5,1,'2024-04-16T13:00:00.000Z','2024-04-16T14:00:00.000Z',NULL,''),(7,1,'2024-04-25T07:00:00.000Z','1871-07-14T23:29:26.000Z',0,'asd'),(8,1,'2024-04-25T06:00:00.000Z','2024-04-25T07:00:00.000Z',0,'asd'),(15,7,'2024-05-09T07:00:00.000Z','2024-05-09T08:00:00.000Z',0,'aa'),(16,7,'2024-05-16T07:00:00.000Z','2024-05-16T08:00:00.000Z',0,'asd');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_instance`
--

DROP TABLE IF EXISTS `user_instance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_instance` (
  `idInstance` varchar(36) NOT NULL,
  `idUser` int DEFAULT NULL,
  `instanceStart` datetime DEFAULT NULL,
  PRIMARY KEY (`idInstance`),
  KEY `user_logged_idx` (`idUser`),
  CONSTRAINT `user_logged` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_instance`
--

LOCK TABLES `user_instance` WRITE;
/*!40000 ALTER TABLE `user_instance` DISABLE KEYS */;
INSERT INTO `user_instance` VALUES ('b04c183b-c004-4191-94a4-98dee3f3238c',1,'2024-05-07 13:30:39');
/*!40000 ALTER TABLE `user_instance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(15) DEFAULT NULL,
  `Username` varchar(20) DEFAULT NULL,
  `Email` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'janis','Mim05','janiskrisjanis.g@gmail.com','abols1234'),(4,'Aigars','MyScreenIsOff','Cirulis05@gmail.com','league4life'),(7,'Jana','MazaNarina','Mazanarina2@gmail.com','mazanarina1'),(10,'JohnDOe2','Meagainhello','johndoee2e@gmail.com','‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎12345'),(11,'JohnDOe3','Meagainhello2','johndoee23e@gmail.com','???????????????12'),(12,';DROP * `users`','<h1>epic</h1>','email123@gmail.com','123123123123'),(13,'JohnDOe4','JohnDoereal','johndoeee4@gmail.com','JohnDoe12345');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workers`
--

DROP TABLE IF EXISTS `workers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workers` (
  `idUser` int NOT NULL,
  `tenure` int DEFAULT NULL,
  `StartWorkDate` date DEFAULT NULL,
  `WorkerType` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workers`
--

LOCK TABLES `workers` WRITE;
/*!40000 ALTER TABLE `workers` DISABLE KEYS */;
INSERT INTO `workers` VALUES (1,2,'2022-04-22','Main admin');
/*!40000 ALTER TABLE `workers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-08  8:39:13
