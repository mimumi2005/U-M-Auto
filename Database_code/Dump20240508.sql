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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,9,'2024-06-03T06:00:00.000Z','2024-06-03T07:00:00.000Z',0,'Quick oil change'),(2,10,'2024-06-04T06:00:00.000Z','2024-06-04T07:00:00.000Z',0,''),(3,11,'2024-06-03T12:00:00.000Z','2024-06-03T13:00:00.000Z',0,''),(4,12,'2024-06-10T06:00:00.000Z','2024-06-15T12:00:00.000Z',0,'PINK!!!!'),(5,13,'2024-05-28T06:00:00.000Z','2024-05-28T07:00:00.000Z',0,''),(6,13,'2024-06-07T06:00:00.000Z','2024-06-07T11:00:00.000Z',1,''),(7,14,'2024-06-10T15:00:00.000Z','2024-06-10T16:00:00.000Z',0,''),(8,15,'2024-06-03T06:00:00.000Z','2024-06-08T12:00:00.000Z',0,'Red paint job'),(9,16,'2024-05-28T13:00:00.000Z','2024-05-28T14:00:00.000Z',0,''),(10,16,'2024-05-31T10:00:00.000Z','2024-05-31T11:00:00.000Z',0,''),(11,16,'2024-06-21T11:00:00.000Z','2024-06-21T15:00:00.000Z',0,''),(12,17,'2024-05-28T11:00:00.000Z','2024-05-28T12:00:00.000Z',0,''),(13,17,'2024-06-17T06:00:00.000Z','2024-06-18T11:00:00.000Z',1,''),(14,17,'2024-05-30T15:00:00.000Z','2024-06-30T05:00:00.000Z',1,''),(15,17,'2024-06-28T06:00:00.000Z','2024-06-28T10:00:00.000Z',0,''),(16,6,'2024-06-17T06:00:00.000Z','2024-06-23T12:00:00.000Z',0,'Purple car paint job'),(17,6,'2024-07-01T06:00:00.000Z','2024-07-01T07:00:00.000Z',0,''),(18,3,'2024-05-30T11:00:00.000Z','2024-05-30T15:00:00.000Z',0,''),(19,3,'2024-06-10T13:00:00.000Z','2024-06-10T14:00:00.000Z',0,''),(20,7,'2024-05-30T14:00:00.000Z','2024-05-30T15:00:00.000Z',0,''),(21,7,'2024-07-03T15:00:00.000Z','2024-07-03T16:00:00.000Z',0,'');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'janis','Mim05','janiskrisjanis.g@gmail.com','abols123'),(2,'janis','Mimumi2005','janiskrijanis.g@gmail.com','Abols1234'),(3,'PumaLV','PumaLV','Baltins@gmail.com','baltins1'),(4,'Matiss','Matq','Matisins@gmail.com','25565'),(5,'Aigars','MyScreenIsOff','Homielover123@gmail.com','dariusGaming'),(6,'Jana','MazaNarina','Mazanarina2@gmail.com','mazanarina2'),(7,'Sidnijs','Kehren','Sidnijs05@gmail.com','BlackMen'),(8,'Edijs','Sentience','Edijs229@gmail.com','qw12345'),(9,'John Smith','johnsmith','john.smith@example.com','J!h2#K9m'),(10,'Mary Johnson','maryjohnson','mary.johnson@example.com','M@r7$N2p'),(11,'James Williams','jameswilliams','james.williams@example.com','J!m5&Y7r'),(12,'Patricia Brown','patriciabrown','patricia.brown@example.com','P@t8^R3s'),(13,'Robert Jones','robertjones','robert.jones@example.com','R!o2#S6t'),(14,'Jennifer Garcia','jennifergarcia','jennifer.garcia@example.com','J@e7$V2p'),(15,'Michael Miller','michaelmiller','michael.miller@example.com','M!c5&L8r'),(16,'Linda Martinez','lindamartinez','linda.martinez@example.com','L@d9^N3s'),(17,'William Hernand','williamhernandez','william.hernandez@example.com','W!l2#P7m');
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
INSERT INTO `workers` VALUES (1,0,'2024-05-28','Admin'),(2,0,'2024-05-28','Worker_test'),(4,0,'2024-05-28','Mechanic'),(6,0,'2024-05-28','Bookkeeper');
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

-- Dump completed on 2024-05-28 11:47:59
