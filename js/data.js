// ============================================================
//  MigrantIA · datos: líneas de ayuda, consulados y guías por caso
//  Fuentes: SRE "Representaciones de México en EEUU" (ene-2024),
//  directorio SRE, CIAM (gob.mx), ACF/HHS (líneas nacionales).
//  VERIFIQUEN los números antes de la demo final.
// ============================================================

window.HOTLINES = {
  n911:  { tel: "911",          display: "911",            icon: "siren",   key: "h911" },
  ciam:  { tel: "+15206237874", display: "1-520-623-7874", icon: "consulate", key: "hciam" },
  h211:  { tel: "211",          display: "211",            icon: "house",   key: "h211" },
  dv:    { tel: "+18007997233", display: "1-800-799-7233", icon: "shield",  key: "hdv", sms: { to: "88788", body: "START" } },
  trata: { tel: "+18883737888", display: "1-888-373-7888", icon: "chain",   key: "htrata", sms: { to: "233733", body: "HELP" } },
  h988:  { tel: "988",          display: "988",            icon: "heart",   key: "h988" },
};

// Top 5 estados por población nacida en el extranjero (ACS 2024):
// CA 10.9 M · TX 5.8 M · FL 5.4 M · NY 4.6 M · NJ 2.4 M
window.STATES = {
  CA: {
    name: { es: "California", en: "California", pt: "Califórnia" },
    pop: "10.9 M",
    consulates: [
      { city: "Los Ángeles", tel: "+12133516800", display: "213-351-6800", prot: "213-368-2732", main: true },
      { city: "San Diego", tel: "+16192318414", display: "619-231-8414", prot: "619-308-9946" },
      { city: "San Francisco", tel: "+14153541700", display: "415-354-1700" },
      { city: "San José", tel: "+14088562840", display: "408-856-2840" },
      { city: "Sacramento", tel: "+19163293500", display: "916-329-3500", prot: "916-329-3508" },
      { city: "Fresno", tel: "+15592333065", display: "559-233-3065", prot: "559-233-4241" },
      { city: "Santa Ana", tel: "+17143853069", display: "714-385-3069" },
      { city: "Oxnard", tel: "+18059848738", display: "805-984-8738" },
      { city: "Calexico", tel: "+17603573863", display: "760-357-3863" },
    ],
  },
  TX: {
    name: { es: "Texas", en: "Texas", pt: "Texas" },
    pop: "5.8 M",
    consulates: [
      { city: "Houston", tel: "+17132716800", display: "713-271-6800", main: true },
      { city: "Dallas", tel: "+12149328670", display: "214-932-8670", prot: "214-932-0635" },
      { city: "Austin", tel: "+15124782866", display: "512-478-2866", prot: "512-382-2810" },
      { city: "Brownsville", tel: "+19565444267", display: "956-544-4267" },
      { city: "Del Río", tel: "+18307752352", display: "830-775-2352" },
    ],
    more: "San Antonio, El Paso, Laredo, McAllen, Eagle Pass, Presidio",
  },
  FL: {
    name: { es: "Florida", en: "Florida", pt: "Flórida" },
    pop: "5.4 M",
    consulates: [
      { city: "Miami", tel: "+17862684900", display: "786-268-4900", prot: "786-268-4896", main: true },
      { city: "Orlando", tel: "+14074220514", display: "407-422-0514" },
    ],
  },
  NY: {
    name: { es: "Nueva York", en: "New York", pt: "Nova York" },
    pop: "4.6 M",
    consulates: [
      { city: "Nueva York", tel: "+12122176400", display: "212-217-6400", prot: "212-217-6437", main: true },
    ],
  },
  NJ: {
    name: { es: "Nueva Jersey", en: "New Jersey", pt: "Nova Jersey" },
    pop: "2.4 M",
    consulates: [
      { city: "New Brunswick", tel: "+18482371260", display: "848-237-1260", prot: "848-237-1266", main: true },
      { city: "Filadelfia (sur de NJ)", tel: "+12159224262", display: "215-922-4262" },
    ],
  },
};

// ------------------------------------------------------------
// Guías por caso (se muestran al tocar un pictograma y como
// respuesta offline si el agente no contesta).
// ------------------------------------------------------------
window.CASES = {
  albergue: {
    icon: "house", level: "AMARILLO", calls: ["h211", "ciam", "n911"],
    keywords: ["dormir", "albergue", "dinero", "calle", "alojamiento", "refugio", "sleep", "shelter", "money", "homeless", "street", "dormir", "abrigo", "dinheiro", "rua", "moradia"],
    es: {
      tile: "No tengo dónde dormir",
      title: "Sin alojamiento ni dinero",
      sample: "Estoy en una ciudad que no conozco, no tengo dónde dormir con mi hija y no tengo dinero. ¿Me pueden ayudar?",
      now: ["Si tú o tu hija están en peligro o enfermas: llama al 911.", "Llama al 211: te dicen dónde hay albergues, comida y ayuda cerca.", "Dinos solo tu ciudad y estado (no tu dirección exacta)."],
      can: "El consulado puede escucharte, orientarte, buscar albergues para mujeres con niñas y niños y valorar si aplica el programa de repatriación para personas en situación de vulnerabilidad (mujeres con infantes, insolvencia temporal).",
      cannot: "No puede prometer una cama, dinero ni hotel. Los apoyos están sujetos a valoración y normatividad.",
      law: "Guía de Protección Consular SRE: Repatriación de personas vulnerables · Ley del Servicio Exterior Mexicano, art. 2 fr. II",
    },
    en: {
      tile: "I have nowhere to sleep",
      title: "No shelter, no money",
      sample: "I'm in a city I don't know, I have nowhere to sleep with my daughter and no money. Can you help me?",
      now: ["If you or your child are in danger or sick: call 911.", "Call 211: they tell you where shelters, food and help are nearby.", "Tell us only your city and state (not your exact address)."],
      can: "The consulate can listen, guide you, look for shelters for women with children and assess whether the repatriation program for vulnerable people applies (women with infants, temporary insolvency).",
      cannot: "It cannot promise a bed, money or a hotel. Support is subject to assessment and regulations.",
      law: "SRE Consular Protection Guide: Repatriation of vulnerable persons · Mexican Foreign Service Law, art. 2 sec. II",
    },
    pt: {
      tile: "Não tenho onde dormir",
      title: "Sem abrigo e sem dinheiro",
      sample: "Estou numa cidade que não conheço, não tenho onde dormir com minha filha e não tenho dinheiro. Podem me ajudar?",
      now: ["Se você ou sua filha estão em perigo ou doentes: ligue 911.", "Ligue 211: indicam abrigos, comida e ajuda perto de você.", "Diga só sua cidade e estado (não o endereço exato)."],
      can: "O consulado pode ouvir, orientar, procurar abrigos para mulheres com crianças e avaliar o programa de repatriação para pessoas vulneráveis (mulheres com bebês, insolvência temporária).",
      cannot: "Não pode prometer cama, dinheiro nem hotel. Os apoios dependem de avaliação e das normas.",
      law: "Guia de Proteção Consular SRE: Repatriação de pessoas vulneráveis · Lei do Serviço Exterior Mexicano, art. 2 inc. II",
    },
  },

  violencia: {
    icon: "shield", level: "NARANJA", calls: ["n911", "dv", "ciam"],
    keywords: ["amenaza", "golpe", "pega", "controla", "violencia", "pareja", "esposo", "miedo", "threat", "hit", "abuse", "control", "violence", "husband", "partner", "afraid", "ameaça", "bate", "violência", "marido", "medo"],
    es: {
      tile: "Me amenazan o controlan",
      title: "Amenazas y control",
      sample: "La persona con la que viajé me amenaza y controla mi teléfono. Mi hija está conmigo. ¿Qué hago?",
      now: ["Si esa persona revisa tu teléfono: cierra esta página con el botón SALIR RÁPIDO.", "Peligro inmediato: llama al 911.", "Línea de violencia doméstica (en español, 24 h): 1-800-799-7233 o envía START al 88788."],
      can: "El consulado puede orientarte, ubicar servicios para mujeres y niñas, darte contactos legales y revisar tu caso con prioridad. En EE. UU. las víctimas de violencia doméstica pueden calificar para la Visa U o VAWA, que dan protección migratoria. Un abogado debe evaluarlo.",
      cannot: "No actúa sin que tú lo pidas. No sustituye a la policía ni decide custodia. No tramita visas.",
      law: "Guía SRE: Violencia doméstica (VAWA, Visa U) · Convención sobre los Derechos del Niño, art. 19",
    },
    en: {
      tile: "I'm threatened or controlled",
      title: "Threats and control",
      sample: "The person I traveled with threatens me and controls my phone. My daughter is with me. What do I do?",
      now: ["If that person checks your phone: close this page with the QUICK EXIT button.", "Immediate danger: call 911.", "Domestic violence hotline (24/7, Spanish available): 1-800-799-7233 or text START to 88788."],
      can: "The consulate can guide you, find services for women and girls, give legal contacts and review your case as a priority. In the U.S., domestic violence victims may qualify for a U visa or VAWA, which give immigration protection. A lawyer must assess it.",
      cannot: "It does not act without your request. It doesn't replace the police or decide custody. It does not process visas.",
      law: "SRE Guide: Domestic violence (VAWA, U visa) · Convention on the Rights of the Child, art. 19",
    },
    pt: {
      tile: "Me ameaçam ou controlam",
      title: "Ameaças e controle",
      sample: "A pessoa com quem viajei me ameaça e controla meu telefone. Minha filha está comigo. O que faço?",
      now: ["Se essa pessoa olha seu telefone: feche esta página com o botão SAIR RÁPIDO.", "Perigo imediato: ligue 911.", "Linha de violência doméstica (24 h): 1-800-799-7233 ou envie START para 88788."],
      can: "O consulado pode orientar, encontrar serviços para mulheres e meninas, dar contatos jurídicos e revisar seu caso com prioridade. Nos EUA, vítimas de violência doméstica podem ter direito ao Visto U ou VAWA, que dão proteção migratória. Um advogado deve avaliar.",
      cannot: "Não age sem o seu pedido. Não substitui a polícia nem decide guarda. Não emite vistos.",
      law: "Guia SRE: Violência doméstica (VAWA, Visto U) · Convenção sobre os Direitos da Criança, art. 19",
    },
  },

  medica: {
    icon: "hospital", level: "ROJO", calls: ["n911", "ciam"],
    keywords: ["fiebre", "enferm", "hospital", "médico", "medico", "doctor", "respira", "sangre", "dolor", "fever", "sick", "breath", "pain", "blood", "febre", "doente", "hospital", "dor", "sangue"],
    es: {
      tile: "Mi hija/o está enfermo",
      title: "Emergencia médica",
      sample: "Mi hija de 3 años tiene fiebre alta y está muy débil. No sé a dónde llevarla y no tengo seguro médico.",
      now: ["Llama al 911 o ve a urgencias (EMERGENCY ROOM) AHORA.", "Las urgencias deben atenderla aunque no tengas seguro.", "No esperes al consulado."],
      can: "El consulado puede darte información de hospitales y clínicas cerca y recibir tu solicitud de asistencia.",
      cannot: "No puede diagnosticar ni pagar servicios médicos u hospitalarios.",
      law: "Convención sobre los Derechos del Niño, art. 24: derecho al más alto nivel posible de salud",
    },
    en: {
      tile: "My child is sick",
      title: "Medical emergency",
      sample: "My 3-year-old daughter has a high fever and is very weak. I don't know where to take her and I have no health insurance.",
      now: ["Call 911 or go to the EMERGENCY ROOM NOW.", "Emergency rooms must see her even without insurance.", "Don't wait for the consulate."],
      can: "The consulate can give you information about nearby hospitals and clinics and receive your assistance request.",
      cannot: "It cannot diagnose or pay for medical or hospital services.",
      law: "Convention on the Rights of the Child, art. 24: right to the highest attainable standard of health",
    },
    pt: {
      tile: "Meu filho/a está doente",
      title: "Emergência médica",
      sample: "Minha filha de 3 anos está com febre alta e muito fraca. Não sei aonde levá-la e não tenho seguro de saúde.",
      now: ["Ligue 911 ou vá ao pronto-socorro (EMERGENCY ROOM) AGORA.", "O pronto-socorro deve atendê-la mesmo sem seguro.", "Não espere pelo consulado."],
      can: "O consulado pode informar hospitais e clínicas próximos e receber seu pedido de assistência.",
      cannot: "Não pode diagnosticar nem pagar serviços médicos ou hospitalares.",
      law: "Convenção sobre os Direitos da Criança, art. 24: direito ao mais alto nível possível de saúde",
    },
  },

  detencion: {
    icon: "lock", level: "NARANJA", calls: ["ciam", "n911"],
    keywords: ["detuv", "detenid", "arrest", "ice", "cárcel", "carcel", "policía", "policia", "separ", "detained", "jail", "police", "separated", "preso", "presa", "polícia", "separad"],
    es: {
      tile: "Me detuvieron / separada de mi hija/o",
      title: "Madre detenida y menor separado",
      sample: "Me detuvieron y no sé dónde está mi hija. ¿Puede localizarla el consulado?",
      now: ["Di: \"I want to contact the Mexican Consulate\" (quiero hablar con el consulado de México).", "No firmes nada que no entiendas. Pide intérprete.", "Tu familia puede llamar al CIAM 24 h: 1-520-623-7874."],
      can: "Tienes derecho a que avisen al consulado y a comunicarte con él. El consulado puede visitarte, vigilar el debido proceso, darte abogados y buscar a tu hija. Si un menor queda con autoridades, el consulado vigila sus intereses e intenta preservar tu custodia.",
      cannot: "No puede sacarte de la detención, pagar fianzas ni ser tu abogado.",
      law: "Convención de Viena, arts. 36 y 37 b · CDN arts. 3 y 9: no separar a niñas y niños de sus padres contra su voluntad",
    },
    en: {
      tile: "I was detained / separated from my child",
      title: "Detained mother, separated child",
      sample: "I was detained and I don't know where my daughter is. Can the consulate find her?",
      now: ["Say: \"I want to contact the Mexican Consulate\".", "Don't sign anything you don't understand. Ask for an interpreter.", "Your family can call CIAM 24/7: 1-520-623-7874."],
      can: "You have the right to have the consulate notified and to communicate with it. The consulate can visit you, monitor due process, refer lawyers and look for your child. If a child is in custody of authorities, the consulate protects their interests and tries to preserve your custody.",
      cannot: "It cannot get you released, pay bail or be your lawyer.",
      law: "Vienna Convention, arts. 36 and 37(b) · CRC arts. 3 and 9: children shall not be separated from parents against their will",
    },
    pt: {
      tile: "Fui detida / separada do meu filho/a",
      title: "Mãe detida e criança separada",
      sample: "Fui detida e não sei onde está minha filha. O consulado pode localizá-la?",
      now: ["Diga: \"I want to contact the Mexican Consulate\".", "Não assine nada que não entenda. Peça intérprete.", "Sua família pode ligar para o CIAM 24 h: 1-520-623-7874."],
      can: "Você tem direito de que avisem o consulado e de se comunicar com ele. O consulado pode visitá-la, vigiar o devido processo, indicar advogados e procurar sua filha. Se a criança ficar com as autoridades, o consulado protege os interesses dela e tenta preservar sua guarda.",
      cannot: "Não pode tirá-la da detenção, pagar fiança nem ser seu advogado.",
      law: "Convenção de Viena, arts. 36 e 37 b · CDC arts. 3 e 9: crianças não devem ser separadas dos pais contra a vontade",
    },
  },

  trata: {
    icon: "chain", level: "NARANJA", calls: ["trata", "n911", "ciam"],
    keywords: ["documentos", "papeles", "no me dejan", "trabajo", "deuda", "encerrad", "obligan", "trafficking", "papers", "won't let me", "debt", "forced", "locked", "documentos", "não me deixam", "dívida", "obrigam", "trabalho"],
    es: {
      tile: "Me retienen / no me dejan ir",
      title: "Posible trata o explotación",
      sample: "Me ofrecieron trabajo y ahora no me dejan irme. Retienen mis documentos y me dicen que, si pido ayuda, me quitarán a mi hija.",
      now: ["Si controlan tu teléfono, cierra esta página al terminar (SALIR RÁPIDO).", "Línea contra la trata (24 h, en español): 1-888-373-7888 o texto al 233733.", "Peligro inmediato: 911, solo si es seguro hacerlo."],
      can: "Nadie puede quitarte tus documentos. El consulado da atención especializada a víctimas de trata, te conecta con refugios especializados y servicios médicos y psicológicos. En EE. UU. existe la Visa T para víctimas de trata. Un abogado debe evaluarla.",
      cannot: "No puede regularizar tu situación ni obligar a las autoridades. No actúa sin que tú lo pidas.",
      law: "CDN art. 35 (impedir la trata de niños) · Convención sobre Trabajadores Migratorios, art. 21 · Guía SRE: Trata",
    },
    en: {
      tile: "They hold me / won't let me leave",
      title: "Possible trafficking or exploitation",
      sample: "They offered me a job and now they won't let me leave. They keep my documents and say that if I ask for help they will take my daughter.",
      now: ["If they control your phone, close this page when done (QUICK EXIT).", "Trafficking hotline (24/7, Spanish available): 1-888-373-7888 or text 233733.", "Immediate danger: 911, only if it is safe."],
      can: "No one can take your documents. The consulate gives specialized care to trafficking victims and connects you with specialized shelters and medical and psychological services. The U.S. has the T visa for trafficking victims. A lawyer must assess it.",
      cannot: "It cannot regularize your status or force authorities. It does not act without your request.",
      law: "CRC art. 35 (prevent child trafficking) · Migrant Workers Convention, art. 21 · SRE Guide: Trafficking",
    },
    pt: {
      tile: "Me prendem / não me deixam sair",
      title: "Possível tráfico ou exploração",
      sample: "Me ofereceram trabalho e agora não me deixam sair. Ficam com meus documentos e dizem que, se eu pedir ajuda, vão tirar minha filha.",
      now: ["Se controlam seu telefone, feche esta página ao terminar (SAIR RÁPIDO).", "Linha contra o tráfico (24 h): 1-888-373-7888 ou texto para 233733.", "Perigo imediato: 911, só se for seguro."],
      can: "Ninguém pode tirar seus documentos. O consulado dá atenção especializada a vítimas de tráfico e conecta com abrigos especializados e serviços médicos e psicológicos. Nos EUA existe o Visto T para vítimas de tráfico. Um advogado deve avaliar.",
      cannot: "Não pode regularizar sua situação nem obrigar as autoridades. Não age sem o seu pedido.",
      law: "CDC art. 35 (impedir o tráfico de crianças) · Convenção sobre Trabalhadores Migrantes, art. 21 · Guia SRE: Tráfico",
    },
  },
};
