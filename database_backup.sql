-- MySQL dump 10.13  Distrib 9.6.0, for macos26.3 (arm64)
--
-- Host: localhost    Database: subway_inventory
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '0cc2759c-2ad9-11f1-b90c-6a866564c9c2:1-1382';

--
-- Table structure for table `Categorias`
--

DROP TABLE IF EXISTS `Categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categorias`
--

LOCK TABLES `Categorias` WRITE;
/*!40000 ALTER TABLE `Categorias` DISABLE KEYS */;
INSERT INTO `Categorias` VALUES (1,'MP ADEREZOS'),(2,'MP AGUA'),(3,'MP AZUCAR'),(4,'MP BANDEJAS'),(5,'MP BOLSAS'),(6,'MP CAFE'),(7,'MP CARNES'),(8,'MP CJA VDE/DELI SADW'),(9,'MP COMBO ENSALADA'),(10,'MP CUBIERTOS'),(11,'MP EMBUTIDOS'),(12,'MP EMPAQUE DESECHABL'),(13,'MP GASEOSAS'),(14,'MP HARINAS'),(15,'MP LACTEOS'),(16,'MP LIMPIEZA'),(17,'MP MARISCOS'),(18,'MP OTR. GTOS. COMIDA'),(19,'MP PAPEL FILM'),(20,'MP PAPITAS'),(21,'MP QUESOS'),(22,'MP QUIMICOS'),(23,'MP SERVILLETAS'),(24,'MP TE HELADO'),(25,'MP VASOS Y TAPAS'),(26,'MP VEGETALES');
/*!40000 ALTER TABLE `Categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Conteo_Items`
--

DROP TABLE IF EXISTS `Conteo_Items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Conteo_Items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conteo_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `producto_id` varchar(50) DEFAULT NULL,
  `ubicacion_id` varchar(50) DEFAULT NULL,
  `cantidad_cajas` decimal(10,2) DEFAULT '0.00',
  `cantidad_sueltas` decimal(10,2) DEFAULT '0.00',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conteo_id` (`conteo_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `producto_id` (`producto_id`),
  KEY `ubicacion_id` (`ubicacion_id`),
  CONSTRAINT `conteo_items_ibfk_1` FOREIGN KEY (`conteo_id`) REFERENCES `Conteos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conteo_items_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `conteo_items_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `Productos` (`articuloid`) ON DELETE CASCADE,
  CONSTRAINT `conteo_items_ibfk_4` FOREIGN KEY (`ubicacion_id`) REFERENCES `Ubicaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Conteo_Items`
--

LOCK TABLES `Conteo_Items` WRITE;
/*!40000 ALTER TABLE `Conteo_Items` DISABLE KEYS */;
INSERT INTO `Conteo_Items` VALUES (17,1,1,'M00207','1',9.00,4.00,'2026-03-28 19:34:24'),(19,1,1,'M00207','1',0.00,123.00,'2026-03-30 08:08:02'),(20,1,1,'M00207','1',4.00,0.00,'2026-03-30 08:27:41'),(22,1,1,'M00207','1',6.00,0.00,'2026-03-30 08:35:31'),(23,1,1,'M00207','1',79.60,0.00,'2026-03-30 08:39:19'),(24,1,1,'M00207','1',0.00,7.00,'2026-03-30 08:39:34'),(25,1,1,'M00207','1',22.43,0.00,'2026-03-30 08:49:53'),(26,1,1,'M00207','1',3.00,0.00,'2026-03-30 09:14:44'),(27,2,1,'M00207','3',0.00,5.00,'2026-03-30 09:40:16'),(28,2,2,'M00207','3',0.00,2.00,'2026-03-30 14:16:20'),(29,2,2,'M00209','3',0.00,3.00,'2026-03-30 14:16:35'),(30,3,1,'M00101','4',1.00,0.00,'2026-03-31 09:45:18'),(31,3,1,'M00101','4',3.00,0.00,'2026-03-31 14:27:17'),(32,7,2,'M00209','1',2.00,0.00,'2026-03-31 15:47:15'),(33,8,1,'M00101','4',0.00,5.00,'2026-03-31 18:34:17'),(34,8,1,'M00102','4',0.00,10.00,'2026-03-31 18:35:22'),(35,10,1,'M00207','1',1.00,0.00,'2026-04-06 10:12:34'),(36,10,1,'M00207','1',1.00,0.00,'2026-04-06 10:12:48'),(37,10,1,'B-POLLO-01','2',2.00,0.00,'2026-04-06 10:23:43'),(38,10,1,'B-POLLO-01','2',0.00,4.00,'2026-04-06 10:23:50');
/*!40000 ALTER TABLE `Conteo_Items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Conteos`
--

DROP TABLE IF EXISTS `Conteos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Conteos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sucursal_id` int DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `fecha_conteo` date DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'Abierto',
  `total_piezas` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session` (`sucursal_id`,`fecha_conteo`,`tipo`),
  CONSTRAINT `conteos_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `Sucursales` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Conteos`
--

LOCK TABLES `Conteos` WRITE;
/*!40000 ALTER TABLE `Conteos` DISABLE KEYS */;
INSERT INTO `Conteos` VALUES (1,1,'2026-03-28 19:03:50','2026-03-28','Diario','Finalizado',13),(2,1,'2026-03-30 09:39:01','2026-03-30','Diario','Finalizado',0),(3,14,'2026-03-31 08:23:29','2026-03-31','Diario','Abierto',0),(5,2,'2026-03-31 14:48:55','2026-03-31','Diario','Abierto',0),(6,22,'2026-03-31 14:50:15','2026-03-31','Diario','Abierto',0),(7,1,'2026-03-31 15:43:56','2026-03-31','Diario','Abierto',0),(8,1,'2026-03-31 18:33:14','2026-04-01','Diario','Finalizado',0),(9,19,'2026-04-01 11:36:48','2026-04-01','Semanal','Abierto',0),(10,10,'2026-04-06 10:12:09','2026-04-06','Diario','Abierto',0);
/*!40000 ALTER TABLE `Conteos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Productos`
--

DROP TABLE IF EXISTS `Productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Productos` (
  `articuloid` varchar(50) NOT NULL,
  `itemname` varchar(200) DEFAULT NULL,
  `UnidadCompra` varchar(50) DEFAULT NULL,
  `cantidadCompra` decimal(10,2) DEFAULT NULL,
  `unidad_venta` varchar(50) DEFAULT NULL,
  `cantidadventa` decimal(10,2) DEFAULT NULL,
  `ItmsGrpNam` varchar(100) DEFAULT NULL,
  `Ubicacion` json DEFAULT NULL,
  `min` decimal(10,2) DEFAULT NULL,
  `max` decimal(10,2) DEFAULT NULL,
  `es_producido` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`articuloid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Productos`
--

LOCK TABLES `Productos` WRITE;
/*!40000 ALTER TABLE `Productos` DISABLE KEYS */;
INSERT INTO `Productos` VALUES ('B-POLLO-01','Batch Mezcla Pollo','UNIDAD',1.00,'UNID',1.00,'PRODUCTOS PRODUCIDOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',NULL,NULL,1),('M00101','PAN BLANCO','CAJA',70.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00102','PAN INTEGRAL','CAJA',70.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00103','GALLETA CHOCOCHIP','CAJA',180.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": 7, \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00104','GALLETA AVENA CON PASAS','CAJA',180.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00106','GALLETA CHOCOLATE BLANCO/DOBLE','CAJA',180.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00107','GALLETA CHOCOMAC','CAJA',180.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00108','GALLETA CHEESE CAKE','CAJA',180.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00201','JAMON VIRGINIA','PAQUETE',35.27,'OZ',1.00,'MP EMBUTIDOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00202','JAMON DE PAVO','KILO',35.20,'OZ',1.00,'MP EMBUTIDOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00204','SALAMI','CAJA',256.00,'OZ',1.00,'MP EMBUTIDOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00205','PEPERONI','CAJA',256.00,'OZ',1.00,'MP EMBUTIDOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00206','TOCINO PRECOCIDO','CAJA',600.00,'PZA',1.00,'MP EMBUTIDOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00207','PECHUGA GRILL','CAJA',400.00,'OZ',1.00,'MP CARNES','[{\"id\": \"1\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00209','STEAK','CAJA',240.00,'OZ',1.00,'MP CARNES','[{\"id\": \"1\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00210','COSTILLA','CAJA',80.00,'PZA',1.00,'MP CARNES','[{\"id\": \"1\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00212','JAMON DE POLLO','PAQUETE',16.00,'OZ',1.00,'MP EMBUTIDOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00215','PATTIES DE POLLO EMPANIZADO','CAJA',400.00,'OZ',1.00,'MP CARNES','[{\"id\": \"1\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00217','SALSA BUFFALO','BOLSA',141.10,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00219','POLLO ROSTIZADO','CAJA',320.00,'OZ',1.00,'MP CARNES','[{\"id\": \"1\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00301','QUESO AMERICANO AMARILLO','BARRA',40.00,'OZ',1.00,'MP QUESOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00302','QUESO AMERICANO BLANCO','BARRA',40.00,'OZ',1.00,'MP QUESOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00306','QUESO CHEDAR','BARRA',40.00,'OZ',1.00,'MP QUESOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00307','CREMA','BOLSA',40.21,'OZ',1.00,'MP QUESOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00401','ATUN','BOLSA',33.51,'OZ',1.00,'MP MARISCOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00501','TOMATES','RED',160.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00502','CEBOLLA MORADA','RED',160.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00503','CHILE VERDE O PIMIENTOS','RED',96.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00504','LECHUGA','BOLSA',40.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00505','PEPINO','RED',112.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00506','AGUACATE','RED',32.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00508','PIÑA RODAJAS','LATA',16.93,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00509','HONGOS','LATA',7.41,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00510','PEPINILLO','BOLSA',50.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00511','BANANA PEPPERS','BOLSA',48.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00512','JALAPEÑOS','BOLSA',51.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00513','ACEITUNA NEGRA','BOLSA',32.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00516','ACEITE SPRAY PAM','BOTE',14.00,'ONZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00517','AZUCAR BLANCA','BOLSA',35.27,'ONZ',1.00,'MP AZUCAR','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00518','CANELA MOLIDA','BOTE',8.29,'ONZ',1.00,'MP AZUCAR','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00519','LECHE ENTERA','CAJA',384.00,'ONZ',1.00,'MP LACTEOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00520','MIEL MAPLE','BOTE',24.00,'ONZ',1.00,'MP AZUCAR','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00521','ESCENCIA DE VAINILLA','BOTE',8.00,'ONZ',1.00,'MP AZUCAR','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00522','EMPAQUE BISAGRADO PARA BUDIN','CAJA',200.00,'PZA',1.00,'MP EMPAQUE DESECHABL','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00601','MAYONESA LIGHT','BOLSA',35.20,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00603','MOSTAZA','BOLSA',123.46,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00605','ACEITE OLIVA','GALON',127.82,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00606','VINAGRE','GALON',138.80,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00607','HARINA DE MAIZ','BOLSA',35.27,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00608','AVENA DULCE','BOLSA',35.27,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00609','OREGANO PARMESANO','BOLSA',35.27,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00611','PIMIENTA NEGRA MOLIDA','BOLSA',31.75,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00612','SALSA CHIPOTLE','BOLSA',35.20,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00613','SALSA RANCH','BOLSA',35.20,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00614','SALSA CEBOLLA DULCE','BOLSA',35.20,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00615','SALSA TERIYAKI','BOLSA',35.20,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00616','SALSA BOLONEZA/MARINARA','BOLSA',134.00,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00618','FRIJOLES MOLIDOS','BOLSA',80.00,'OZ',1.00,'MP VEGETALES','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00619','SALSA DE TOMATE','BOLSA',141.10,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00620','SALSA BARBACOA','BOLSA',35.27,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00621','SALSA HONEY MUSTARD','BOLSA',33.17,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00701','AGUA LITRO','CAJA',12.00,'PZA',1.00,'MP AGUA','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00702','AGUA MEDIO LITRO','CAJA',24.00,'PZA',1.00,'MP AGUA','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00703','B&B COCA-COLA','CAJA',4096.00,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00705','SODA DE LATA COCA','CAJA',24.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00706','SODA DE LATA FANTA','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00707','SODA DE LATA SPRITE','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00708','SODA DE LATA ZERO','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00712','CO2','CILINDRO',20.00,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00714','FUZE TEA MELOCOTON PET','CAJA',12.00,'PZA',1.00,'MP TE HELADO','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00723','JUGO DEL VALLE 500 ML NARANJA','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00724','CAFE','PAQUETE',100.00,'OZ',1.00,'MP CAFE','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00725','COCA 1.25LT','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00732','B&B ZERO','CAJA',4096.00,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00733','B&B FANTA','CAJA',4096.00,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00734','B&B UVA','CAJA',4096.00,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00735','B&B SPRITE','CAJA',4096.00,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00736','UVA LATA','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00737','SODA LATA FRESA','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00738','SODA LATA LIGHT','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00740','FUZE PET LIMON','CAJA',12.00,'PZA',1.00,'MP TE HELADO','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00743','JUGO DEL VALLE 500 ML MANDARINA','CAJA',12.00,'PZA',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00744','B&B FUZE TEA LIMON','CAJA',4096.00,'OZ',1.00,'MP TE HELADO','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00807','TAPA DE 16/21 ONZAS','CAJA',3000.00,'PZA',1.00,'MP VASOS Y TAPAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00811','SERVILLETA SUB','CAJA',6000.00,'PZA',1.00,'MP SERVILLETAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00813','SUB WRAP','CAJA',5000.00,'PZA',1.00,'MP CJA VDE/DELI SADW','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00814','CAJA VERDE/DELI SANWICH','CAJA',4000.00,'PZA',1.00,'MP CJA VDE/DELI SADW','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00815','PAPEL FILM','ROLLO',666.67,'YRD',1.00,'MP PAPEL FILM','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00816','PAJILLA SUBWAY','CAJA',2000.00,'PZA',1.00,'MP VASOS Y TAPAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00817','COMBO ENSALADA','CAJA',252.00,'PZA',1.00,'MP COMBO ENSALADA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00819','VASO PARA CAFE #8','PAQUETE',100.00,'PZA',1.00,'MP VASOS Y TAPAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00820','TAPA PARA CAFE #8','PAQUETE',100.00,'PZA',1.00,'MP VASOS Y TAPAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00822','SUB BOLSA','CAJA',1000.00,'PZA',1.00,'MP BOLSAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00823','BOLSA T SUBWAY','CAJA',375.00,'PZA',1.00,'MP BOLSAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00825','BOLSA DE ESPECIALIDADES','CAJA',2000.00,'PZA',1.00,'MP BOLSAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00826','GUANTES PLASTICOS TALLA M','CAJA',2000.00,'PZA',1.00,'MP BOLSAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00828','AZUCAR DE SOBRE','BOLSA',150.00,'PZA',1.00,'MP AZUCAR','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00829','AZUCAR LIGH','BOLSA',50.00,'PZA',1.00,'MP AZUCAR','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00830','SAL EN SOBRE','BOLSA',500.00,'PZA',1.00,'MP OTR. GTOS. COMIDA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00831','SAL REFINADA','BOLSA',14.11,'OZ',1.00,'MP OTR. GTOS. COMIDA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00832','CREMORA','BOLSA',200.00,'PZA',1.00,'MP OTR. GTOS. COMIDA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00836','PAPA FIESTA','CAJA',50.00,'PZA',1.00,'MP PAPITAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00840','OMELETTE','BOTELLA',16.00,'PZA',1.00,'MP OTR. GTOS. COMIDA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00841','REMOVEDOR','PAQUETE',800.00,'PZA',1.00,'MP VASOS Y TAPAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00855','GUANTES PLASTICOS TALLA L','CAJA',1600.00,'PZA',1.00,'MP BOLSAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00857','BROCCOLI CHEDDAR','CAJA',384.00,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00859','VASO DE SOPA 8OZ','CAJA',500.00,'PZA',1.00,'MP VASOS Y TAPAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00860','TAPA DE VASO DE SOPA 8OZ','CAJA',600.00,'PZA',1.00,'MP VASOS Y TAPAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00861','CUCHARAS','CAJA',500.00,'PZA',1.00,'MP CUBIERTOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00863','VIÑETAS MARCA SUBWAY','CAJA',10000.00,'PZA',1.00,'MP OTR. GTOS. COMIDA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00864','SUB WRAP 15','CAJA',5000.00,'PZA',1.00,'MP CJA VDE/DELI SADW','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00869','DETERGENTE LAVATRASTOS','CAJA',168.00,'PZA',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00871','SANITIZANTE LAVATRASTOS','CAJA',200.00,'PZA',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00872','DESINFECTANTE DE VEGETALES','CAJA',100.00,'PZA',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00873','LIMPIADOR DE VIDRIOS Y MULTISUPERFICIES','CAJA',40.00,'PZA',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00874','QSR LIMPIADOR DE PISOS','CAJA',120.00,'PZA',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00875','LIMPIADOR DE BAÑOS','BOTE 1L',1.00,'BOTE',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00876','PULIDOR ACERO INOXIDABLE','BOTE 1L',1.00,'BOTE',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00877','JABON ANTIMICROBIAL PARA MANOS','BOTE 1G',1.00,'BOTE',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00878','ALCOHOL GEL DESINFECTANTE PARA MANOS','BOTE 800ML',1.00,'BOTE',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00879','DELIMER LIMPIADOR DE SARRO','CAJA',48.00,'PZA',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00880','LIMPIADOR DE TABLAS','BOTE 1G',1.00,'BOTE',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00883','MEDIDOR DE CLORO TIRAS','BOTE',200.00,'PZA',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00884','CUCHILLOS PLASTICOS','CAJA',500.00,'PZA',1.00,'MP COMBO ENSALADA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00885','TENEDORES PLASTICOS','CAJA',500.00,'PZA',1.00,'MP CUBIERTOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00888','SUPER CONTACT CLEANER','BOTE 1LT',1.00,'BOTE 1 LT',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00902','PAPA WAFLE','CAJA',432.00,'ONZ',1.00,'MP PAPITAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00903','CAJA PARA PAPA','CAJA',525.00,'PZA',1.00,'MP EMPAQUE DESECHABL','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00904','VASO 0.5 ONZA','PAQUETE',100.00,'PZA',1.00,'MP EMPAQUE DESECHABL','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00905','TAPA 0.5 ONZA','PAQUETE',100.00,'PZA',1.00,'MP EMPAQUE DESECHABL','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00906','JUGO DEL VALLE NARANJA 1.5 LT','CAJA',6.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00907','JUGO DEL VALLE MANDARINA 1.5 LT','CAJA',6.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00908','JUGO DEL VALLE NARANJA 2.5 LT','CAJA',6.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00909','JUGO DEL VALLE MANDARINA 2.5 LT','CAJA',6.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00912','JUGO DEL VALLE LATA MANZANA','CAJA',24.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00913','JUGO DEL VALLE LATA DURAZNO','CAJA',24.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00914','JUGO DEL VALLE LATA PIÑA','CAJA',24.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00915','JUGO DEL VALLE LATA MANDARINA','CAJA',24.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00916','JUGO DEL VALLE LATA MANGO','CAJA',24.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00917','JUGO DEL VALLE LATA GUAYABA','CAJA',24.00,'UNIDAD',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00926','CAJA TO GO','CAJA',150.00,'PZA',1.00,'MP CJA VDE/DELI SADW','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00927','Papita Lays Original','CAJA',54.00,'PZA',1.00,'MP PAPITAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00928','Papita Lays Queso','CAJA',54.00,'PZA',1.00,'MP PAPITAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00929','Papita Lays crema y especies','CAJA',54.00,'PZA',1.00,'MP PAPITAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00930','Papita Lays Barbacoa','CAJA',54.00,'PZA',1.00,'MP PAPITAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00931','VASOS DE 20 ONZAS','CAJA',1200.00,'PZA',1.00,'MP VASOS Y TAPAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00933','CRISPY ONION','BOLSA',24.00,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00940','DULCE DE LECHE','BOLSA',35.27,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00943','MOZARELLA RALLADO 40 ONZ','BOLSA',40.00,'ONZ',1.00,'MP QUESOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00945','QUESO MIX CHEDDAR +','BOLSA',40.00,'ONZ',1.00,'MP QUESOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00947','CARNITAS DE CERDO','CAJA',336.00,'ONZ',1.00,'MP CARNES','[{\"id\": \"1\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00948','REFRESCO MARACUYA','BOTELLA',63.91,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00949','REFRESCO TAMARINDO','BOTELLA',63.91,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00950','REFRESCO LIMONADA FRESA','BOTELLA',63.91,'OZ',1.00,'MP GASEOSAS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"4\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"6\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00951','JAMON DE PAVO AC','CAJA',288.00,'OZ',1.00,'MP EMBUTIDOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00952','BANDEJA CARTON','CAJA',25.00,'UN',1.00,'MP EMPAQUE DESECHABL','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00953','FRUTOS ROJOS','BOLSA',35.27,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00954','GALLETA BROWNIE','CAJA',180.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00955','GALLETA FRUTOS ROJOS','CAJA',180.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00956','GALLETA DE COLORES','CAJA',180.00,'PZA',1.00,'MP HARINAS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00957','PROVOLONE','CAJA',288.00,'OZ',1.00,'MP QUESOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00958','PEPPER JACK','CAJA',320.00,'OZ',1.00,'MP QUESOS','[{\"id\": \"2\", \"abierto\": true, \"cerrado\": true}, {\"id\": \"3\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00959','ROASTED ALIOLI','BOLSA',70.54,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('M00960','PESTO','BOLSA',35.27,'OZ',1.00,'MP ADEREZOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('P-ATUN','Atun Preparado','UNIDAD',1.00,'UNID',1.00,'PRODUCTOS PRODUCIDOS','[]',NULL,NULL,1),('P-TJAK','Pollo Terijakie','UNIDAD',1.00,'UNID',1.00,'PRODUCTOS PRODUCIDOS','[]',NULL,NULL,1),('PL0003','PAPEL HIGIENICO','ROLLO',1.00,'ROLLO',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0004','PAPEL TOALLA','PAQUETE',2.00,'ROLLO',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0005','WYPALL AZUL','PAQUETE',25.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0006','WYPALL BLANCO','PAQUETE',25.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0007','WYPALL ROSADO','PAQUETE',25.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0008','WYPALL VERDE','PAQUETE',25.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0009','BASURERO DE PEDAL','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0010','MASCONES','PAQUETE',6.00,'PZA',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0011','PALA PLASTICA','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0012','PALO PARA TRAPEADOR COMBINADO','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0013','TRAPEADOR DE MECHA','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0014','TRAPEADOR TRADICIONAL','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0015','BOLSA MEDIO JARDIN','PAQUETE',10.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0017','BOLSA JARDINERA NEGRA','PAQUETE',5.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0018','BOLSA JARDINERA TRANSPARENTE','PAQUETE',5.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0019','BOLSA DE 5 LB','PAQUETE',500.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0020','BOLSAS DE 1 LIBRA','PAQUETE',500.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0068','ESCOBA','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0069','CEPILLO PARA BAÑO','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0070','CEPILLO PARA PISO','PZA',1.00,'PZA',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0071','CEPILLO TIPO PLANCHITA','PZA',1.00,'PZA',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0072','VENTOSA DESTAPADOR DE SANITARIO','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0073','JALADOR DE AGUA PARA PISO','UNIDAD',1.00,'UNIDAD',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0103','DETERGENTE LAVATRASTOS','CAJA',100.00,'UN',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0104','SANITIZANTE LAVATRASTOS','CAJA',100.00,'UN',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0105','DESINFECTANTE DE VEGETALES','BOTE',1.00,'BOTE',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0106','LIMPIADOR MULTISUPERFICIES PISOS Y VIDRIOS','GALON',1.00,'GALON',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0107','DESENGRASANTE','GALON',1.00,'GALON',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0108','PULIDOR DE ACERO','LITRO',1.00,'LITRO',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0109','LIMPIADOR DE TABLAS','GALON',1.00,'GALON',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0110','LIMPIADOR DE LOSA','LITRO',1.00,'LITRO',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0111','JABON DE MANOS','GALON',1.00,'GALON',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0112','ALCOHOL GEL','GALON',1.00,'GALON',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0113','LIMPIADOR DE SARRO','GALON',1.00,'GALON',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0114','TIRAS DE CLORO','ROLLO',1.00,'ROLLO',1.00,'MP QUIMICOS','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0115','PAPEL HIGIENICO','CAJA',6.00,'ROLLO',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('PL0116','PAPEL TOALLA','CAJA',6.00,'ROLLO',1.00,'MP LIMPIEZA','[{\"id\": \"4\", \"abierto\": true, \"cerrado\": true}]',0.00,0.00,0),('T-SILENT-01','Test Silent','UNIDAD',1.00,'UNID',1.00,'PRODUCTOS PRODUCIDOS','[]',NULL,NULL,1);
/*!40000 ALTER TABLE `Productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Recetas`
--

DROP TABLE IF EXISTS `Recetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Recetas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_padre_id` varchar(50) DEFAULT NULL,
  `producto_hijo_id` varchar(50) DEFAULT NULL,
  `cantidad_hijo` decimal(10,4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_padre_id` (`producto_padre_id`),
  KEY `producto_hijo_id` (`producto_hijo_id`),
  CONSTRAINT `recetas_ibfk_1` FOREIGN KEY (`producto_padre_id`) REFERENCES `Productos` (`articuloid`) ON DELETE CASCADE,
  CONSTRAINT `recetas_ibfk_2` FOREIGN KEY (`producto_hijo_id`) REFERENCES `Productos` (`articuloid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Recetas`
--

LOCK TABLES `Recetas` WRITE;
/*!40000 ALTER TABLE `Recetas` DISABLE KEYS */;
INSERT INTO `Recetas` VALUES (1,'M00101','M00102',2.0000),(2,'P-ATUN','M00401',50.0000),(3,'P-ATUN','M00601',10.0000),(4,'B-POLLO-01','M00215',1.0000);
/*!40000 ALTER TABLE `Recetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sucursales`
--

DROP TABLE IF EXISTS `Sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sucursales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bodega` varchar(50) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sucursales`
--

LOCK TABLES `Sucursales` WRITE;
/*!40000 ALTER TABLE `Sucursales` DISABLE KEYS */;
INSERT INTO `Sucursales` VALUES (1,'1','Metrocentro 8a','Local 2, 3o Nivel de la 8 eta. Metrocentro S.S.'),(2,'2','Metrocentro 9a','Metrocentro S.S. 9 eta. Local 4 y 5'),(3,'4','Texaco Masferrer','Col. Escalón, Av. Masferrer, Estación Texaco, San Salvador.'),(4,'5','Galerias','C.C. GALERIAS, Local 325 P. Gral. Escalón. SW 105-01'),(5,'6','Multiplaza','C.C. Multiplaza, Nvl. 2, Antiguo Cuscatlán, La Libertad.'),(6,'7','Ufg','LOCAL B1 Y B7, EDF \"D\" DE LA UFG ,AV. OLIMPICA, S.S'),(7,'8','Santa Ana Metrocentro','Metrocentro Sta. Ana, 2o Nvel Local 3 N, Santa Ana.'),(8,'9','El Platillo Merliot','Blvd. Merliot, Esq. Noroeste del platillo, Antiguo Cuscatlán, La Libertad.'),(9,'12','Unicentro Lourdes Ii','C.C. Unicentro Lourdes, Loc.7-H, Carr. A .Sta. Ana, Km 24, Lourdes Colón, La Libertad'),(10,'14','San Jacinto','10a Av Sur C.Comercial San Jacinto, Local#1 San Jacinto S.S'),(11,'15','Unicentro Soyapango','Calle La Fuente, C.C. Unicentro Soyapango, Loc.58-C, Soyapango, S.S'),(12,'17','Walmart Soyapango','Blvd. del Ejercito Km.5 Walmart Soyapango Loc.8.Soyapango.S.S.'),(13,'19','Miralvalle','Urbanizacion Ciudad Satelite, C.Comercial Satélite Loc #3, San Salvador'),(14,'20','Autopista Sur','CTO. COM. AUTOPISTA SUR LOCAL # 46, BLVD LOS PROCERES, ANT. C. A HUIZUCAR, S.S.'),(15,'21','Depensa Los Heroes','C.C. Despensa de Don Juan, Barrio El Calvario, contiguo, Blvd de los Heroes Local # 17_x000D_\n'),(16,'22','Metrocentro 1a','C.C. Metrocentro - Etapa 1, Blvd de los Heroes, Prolong Av, Andes y Blvd Tutunichapa 164-B_x000D_\n'),(17,'23','Las Palmas','km12.5 carret.pto.de la libertad l#9,c.c.las palmas,la libertad,sta tecla'),(18,'24','Santa Ana Palmar','Av. Fray Felipe De Jesus Morga Sur, Entre 31 y 33 Calle Pte, Santa Ana, Santa Ana.'),(19,'25','Las Terrazas','29 calle pte, L# 3-11, C.C. Las Terrazas entre 10 y 12 av. norte, S.S./S.S.'),(20,'27','Dlc Escalon','CALLE ANTONIO ABAD, AV MASFERRER, LOCAL A-1, GASOLINERA DLC. S.S'),(21,'32','Colonia Medica','DIAG. DR. ARTURO ROMERO, LOCAL 1 Y 2, COL. MEDICA, EDIF 444, S.S./.S.S'),(22,'33','Sonsonate Dollar City','Carret. a Acajutla, km 65 1/2 Dollar city, frente a metro centro, Sonsonate, Sonsonate.'),(23,'34','Metapan','2° Calle Ote. Bo. San pedro, Metapán Santa Ana '),(24,'35','Chalchuapa','Carretara a chalchuapa KM. 75, CC Plaza Real, Cantón Los Amantes, San Sebastián Salitrillo, Santa Ana.'),(25,'36','Ahuachapan','2 AV. SUR LOCAL 1, BO. EL CENTRO, #25 AHUACHAPAN, AHUACHAPAN'),(26,'38','Cojutepeque','1ra CALLE OTE Y AV. STA ANA  CD DE COJUTEPEQUE, COJUTEPEQUE, CUSCATLAN'),(27,'39','Apopa','LOCAL 1, BARRIO SAN SEBASTIAN APOPA, SAN SALVADOR'),(28,'40','Mall San Gabriel','KM. 19 local L-G1,san gabriel, nejapa, s.sr. metropolis san gabriel local L-G!'),(29,'41','Chalatenango Mall Del Sol','CALLE KM 51 1/2, MALL DEL SOL, CARR. TROCAL, LOCAL L-1 CHALATENANGO.'),(30,'45','Santa Ana Maxi Despensa',' AV. INDEPENDENCIA SUR, ENTRE 33 CALLE OTE Y BY PASS, SANTA ANA, SANTA ANA'),(31,'46','Mall Marsella','CARR. A SAN JUAN OPICO, KM 34 1/2, C.C MALL MARSELLA, LOCAL 7, SAN JUAN OPICO, LA LIBERTAD'),(32,'47','Encuentro Opico','POL.2, LOCAL 4, COL. HACIENDA SITIO DEL NIÑO, CC. ENCUENTRO OPICO, SAN JUAN OPICO, LA LIBERTAD'),(33,'48','Sonsonate Encuentro','Intersección de By-pass de Sonsonate a Acajutla Local LM3,Sonsonate '),(34,'49','Paseo','CALL ESQ. DEL PASEO GRAL. ESCALON Y 79 AV NORTE, LOCAL 4, EDIFICIO EL PASEO #4104 S.S'),(35,'50','Encuentro Aguilares','CARR. TRONCAL DEL NORTE, LOCAL L-4, CTRO. COM. AGUILARES, AGUILARES, SAN SALVADOR'),(36,'51','Pasares','CTON. CHANMICO , PLAZA COMERCIAL PASARES, SAN JUAN OPICO, LA LIBERTAD'),(37,'52','Santa Ana Ramblas','CALLE SITIO DEL NIÑO DIOS, Local 21A, CTON. COMECAYO CTRO. LAS RAMBLAS SANTA ANA'),(38,'53','San Vicente','Avenida Crescencio Miranda, #9, San Vicente, El Salvador'),(39,'54','Encuentro Valle Dulce','LOCAL. 67, CTRO. COM. EL ENCUENTRO VALLE DULCE. APOPA, SAN SALVADOR.'),(40,'55','Mall Mediterraneo','Centro Comercial Mall Mediterráneo, Local LC10, Ahuachapan , Ahuachapan'),(41,'56','Encuentro La Libertad','CARR. EL LITORAL, LOCAL. 23 Y 24, CTRO. COM. ENCUENTRO, LA LIBERTAD COSTA, LA LIBERTAD  '),(42,'57','Quezaltepeque Centro','7a Cl. Poniente y Av. 3 de mayo, local L-2, Quezaltepeque'),(43,'59','EPA Proceres','Ferretería EPA, Bulevar Los Próceres, Calle Uno, Colonia San Francisco, San Salvador, San Salvador Centro, San Salvador.'),(44,'60','EPA Soyapango','Ferretería EPA, kilómetro tres y medio Bulevar del Ejército Nacional, Soyapango, San Salvador Este, San Salvador.'),(45,'58','El Trébol','CC. PLAZA EL TREBOL, LOCAL 3 Y 4, CARRETERA AL PUERTO DE LA LIBERTAD, SANTA TECLA, LA LIBERTAD.'),(46,'61','Encuentro Santa Ana','CC. EL ENCUENTRO SANTA ANA, LOCALES 24 Y 25, CARRETERA BYPASS COSTADO ORIENTE DE LA URBANIZACIÓN JARDINES DEL TECANA.');
/*!40000 ALTER TABLE `Sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ubicaciones`
--

DROP TABLE IF EXISTS `Ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ubicaciones` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `abierto` tinyint(1) DEFAULT NULL,
  `cerrado` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ubicaciones`
--

LOCK TABLES `Ubicaciones` WRITE;
/*!40000 ALTER TABLE `Ubicaciones` DISABLE KEYS */;
INSERT INTO `Ubicaciones` VALUES ('1','Congelador',1,1),('2','Refrigerador',1,1),('3','Sanwichera',1,0),('4','Seco',1,1),('5','Backcounter',1,0),('6','Camara de Sodas',1,0),('7','Galletero',1,0),('8','Estanterias Frente Tienda',1,0),('9','Retardador',1,0);
/*!40000 ALTER TABLE `Ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Usuarios`
--

DROP TABLE IF EXISTS `Usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `pin_code` varchar(10) NOT NULL,
  `rol` varchar(50) DEFAULT 'Cajero',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Usuarios`
--

LOCK TABLES `Usuarios` WRITE;
/*!40000 ALTER TABLE `Usuarios` DISABLE KEYS */;
INSERT INTO `Usuarios` VALUES (1,'Admin Maestro','1234','Admin'),(2,'Cajero Invitado','0000','Cajero');
/*!40000 ALTER TABLE `Usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-07  7:41:29
