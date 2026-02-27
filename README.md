#  Sistema de Inventario Inteligente con Integración Telegram

Aplicación web Full Stack diseñada para la gestión de inventario con monitoreo proactivo y automatización de alertas en tiempo real mediante integración con Telegram Bot.

El sistema permite controlar entradas, salidas y ventas, centralizando la información en un panel administrativo moderno y optimizando la toma de decisiones del negocio.

---

## Descripción General

Este sistema fue desarrollado para mejorar la gestión operativa de pequeños y medianos comercios, eliminando la necesidad de monitoreo manual constante del stock.

El diferencial tecnológico es la integración de un Bot de Telegram que actúa como canal de notificación y consulta remota.

---

##  Funcionalidades

###  Gestión de Inventario
- Registro de productos
- Control de entradas y salidas
- Actualización automática de stock
- CRUD completo de productos
- Validación de datos

###  Gestión de Ventas
- Registro de ventas
- Cálculo automático de totales
- Historial de transacciones

###  Sistema de Alertas Inteligente
- Notificación automática cuando el stock es bajo
- Alertas en tiempo real enviadas vía Telegram
- Monitoreo continuo de inventario

### 🤖Bot de Telegram
Comandos personalizados:

- `/ventas_hoy` → Muestra el total de ventas del día
- `/ultima_venta` → Muestra la última transacción registrada
- Alertas automáticas de bajo inventario

Permite consultar el estado del negocio sin necesidad de acceder al panel web.

---

## Stack Tecnológico

### Frontend
- React.js
- Tailwind CSS
- JavaScript (ES6+)

### Backend
- Node.js
- API REST

### Base de Datos
- MongoDB
- Mongoose

### Integraciones
- Telegram Bot API

---

##  Arquitectura

Usuario  
⬇  
Frontend React (SPA)  
⬇  
API REST (Node.js)  
⬇  
MongoDB  

Servicio adicional:
⬇  
Bot de Telegram (Notificaciones y consultas remotas)

---

##  Seguridad

- Autenticación basada en JWT
- Protección de rutas
- Validación de datos en backend

---

##  Aprendizajes Técnicos

- Integración de servicios externos (Telegram API)
- Automatización basada en eventos
- Diseño de sistema de alertas en tiempo real
- Manejo de autenticación JWT
- Modelado de inventario en base de datos NoSQL
- Separación de responsabilidades Frontend / Backend

---

## 📌 Estado del Proyecto

Sistema funcional con arquitectura modular y enfoque en automatización operativa y monitoreo remoto.
