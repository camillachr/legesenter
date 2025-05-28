## Eksamen i Webteknologi 
Bruker Node, Express og mySql.

# Oppgaven: Sandefjord Legesenter
Sandefjord Lege Senter er et moderne legekontor som ønsker å tilby pasientene sine en enklere måte å bestille
timer på. De har sett behovet for å digitalisere timebestillingssystemet sitt, som i dag foregår via telefon eller
oppmøte. Pasientene ønsker mer fleksibilitet, og Lege Senteret har derfor besluttet å utvikle en ny
webapplikasjon for timebestilling.

Senteret har allerede kontaktet et eksternt byrå for å utvikle frontenden, som blir laget i React. Din oppgave som
utvikler er å designe og implementere backend-løsningen. Backend-applikasjonen skal bygges ved hjelp av
Node.js med Express som rammeverk. Applikasjonen vil koble seg til en database (f.eks. MySQL) for å
håndtere brukerdata, timebestillinger, og administrasjon av leger og tilgjengelige tider.

# Krav til oppgaven
- Backend skal håndtere brukeregistrering og autentisering, inkludert beskyttelse av sensitive data som
passord ved bruk av hashing (f.eks. bcrypt).
- En middelware for autentisering skal implementeres for å beskytte bestemte ruter som kun er tilgjengelige
for autoriserte brukere.

Systemet skal tillate pasienter å:
- Se tilgjengelige legetimer
- Bestille time
- Avbestille eller endre en allerede bestilt time

Legekontorets administrasjon skal kunne:
- Legge til og administrere leger og deres tilgjengelighet
- Se en oversikt over bestilte timer
- 
- Det forventes at studentene lager en RESTful API-struktur og dokumenterer API-endepunktene.
- Frontend og design er ikke deres ansvar, men de må tilrettelegge API-et slik at tredjeparts frontend-team
kan koble seg til og bruke backend-tjenestene.
