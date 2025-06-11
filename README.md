# 🚍 Check Bus

**Check Bus** é um sistema inteligente de transporte universitário voltado para o monitoramento seguro e eficiente dos ônibus que atendem estudantes. A aplicação conecta alunos, gestores educacionais e operadores do transporte, permitindo que o fluxo de embarque, ocupação dos ônibus e horários sejam controlados em tempo real com tecnologia de Internet das Coisas (IoT).

O sistema combate problemas como **superlotação, uso desorganizado e falta de controle sobre o embarque**, oferecendo mais segurança e previsibilidade no transporte universitário.

---

## ⚙️ Como funciona

Usuários se cadastram na plataforma e informam, semanal ou mensalmente, os dias e horários em que pretendem usar o transporte. No momento do embarque, utilizam um **cartão RFID** na **catraca eletrônica inteligente**, que registra a entrada automaticamente.

Esses dados são enviados em tempo real para um servidor que:
- Atualiza o **contador de ocupação do ônibus**
- Exibe a **localização via GPS**
- Permite o acompanhamento por gestores e estudantes

A interface web, leve e responsiva, é acessada via celular ou computador e exibe:
- Contador de passageiros embarcados
- Status do sistema (online/offline)
- Localização do ônibus
- Reserva de horários de uso

---

## 🧠 Tecnologias utilizadas

- HTML, CSS e JavaScript
- Firebase (Authentication, Firestore Database)
- GPS via módulo externo (ou localização simulada)
- Interface Web embarcada no ESP32

---

## 🎯 Objetivo

O objetivo do Check Bus é proporcionar um **transporte mais seguro, organizado e eficiente**, com controle em tempo real, evitando filas, superlotação e desperdício de recursos com ônibus ociosos.

---

## 📈 Resultados Esperados

- Controle de entrada de alunos por cartão
- Monitoramento em tempo real da ocupação
- Redução de superlotação e atrasos
- Dados acessíveis por gestores para planejamento do transporte



