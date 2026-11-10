export interface Product {
  id: number;
  no: number;
  designation: string;
  quantite: number;
  prixCession: number;
  prixVente: number;
  seuilAlerte: number;
  datePeremption: string;
  categorie?: string;
  fournisseur?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: "entree" | "sortie" | "ajustement";
  productId: number;
  productName: string;
  quantite: number;
  stockApres: number;
  note: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": 1,
    "no": 1,
    "designation": "ABZ",
    "quantite": 0,
    "prixCession": 750,
    "prixVente": 1013,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 2,
    "no": 2,
    "designation": "Aceland cp",
    "quantite": 0,
    "prixCession": 1600,
    "prixVente": 2160,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 3,
    "no": 3,
    "designation": "Acfol cp",
    "quantite": 0,
    "prixCession": 2050,
    "prixVente": 2768,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 4,
    "no": 4,
    "designation": "Acticarbine cp",
    "quantite": 0,
    "prixCession": 1800,
    "prixVente": 2430,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 5,
    "no": 5,
    "designation": "Actinac b/10",
    "quantite": 0,
    "prixCession": 2550,
    "prixVente": 3443,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 6,
    "no": 6,
    "designation": "Aeris 5mg cp",
    "quantite": 0,
    "prixCession": 3100,
    "prixVente": 4185,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 7,
    "no": 7,
    "designation": "Afsc kit",
    "quantite": 0,
    "prixCession": 4300,
    "prixVente": 5805,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 8,
    "no": 8,
    "designation": "Albendazol",
    "quantite": 50,
    "prixCession": 23.33,
    "prixVente": 31,
    "seuilAlerte": 10,
    "datePeremption": "2028-02-28"
  },
  {
    "id": 9,
    "no": 9,
    "designation": "Aldomet 500mg",
    "quantite": 0,
    "prixCession": 4600,
    "prixVente": 6210,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 10,
    "no": 10,
    "designation": "Aluminium H",
    "quantite": 100,
    "prixCession": 4.95,
    "prixVente": 7,
    "seuilAlerte": 10,
    "datePeremption": "2028-05-31"
  },
  {
    "id": 11,
    "no": 11,
    "designation": "Amapine 10mg",
    "quantite": 0,
    "prixCession": 1000,
    "prixVente": 1350,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 12,
    "no": 12,
    "designation": "Amapine 5mg",
    "quantite": 0,
    "prixCession": 600,
    "prixVente": 810,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 13,
    "no": 13,
    "designation": "Amday-10",
    "quantite": 0,
    "prixCession": 6700,
    "prixVente": 9045,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 14,
    "no": 14,
    "designation": "Amaday P/L",
    "quantite": 0,
    "prixCession": 10100,
    "prixVente": 13635,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 15,
    "no": 15,
    "designation": "Amical cp",
    "quantite": 0,
    "prixCession": 6025,
    "prixVente": 8134,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 16,
    "no": 16,
    "designation": "Amlodenk 10mg",
    "quantite": 0,
    "prixCession": 2225,
    "prixVente": 3004,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 17,
    "no": 17,
    "designation": "Amoxi clav 1000",
    "quantite": 0,
    "prixCession": 5500,
    "prixVente": 7425,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 18,
    "no": 18,
    "designation": "Amoxi gélule",
    "quantite": 0,
    "prixCession": 400,
    "prixVente": 540,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 19,
    "no": 19,
    "designation": "Andol 1000",
    "quantite": 0,
    "prixCession": 1100,
    "prixVente": 1485,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 20,
    "no": 20,
    "designation": "Andol 500",
    "quantite": 0,
    "prixCession": 1100,
    "prixVente": 1485,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 21,
    "no": 21,
    "designation": "Andol vit C",
    "quantite": 0,
    "prixCession": 1100,
    "prixVente": 1485,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 22,
    "no": 22,
    "designation": "Antalgex cp",
    "quantite": 0,
    "prixCession": 1950,
    "prixVente": 2633,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 23,
    "no": 23,
    "designation": "Antinorex cp",
    "quantite": 0,
    "prixCession": 1300,
    "prixVente": 1755,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 24,
    "no": 24,
    "designation": "Aroscarbine",
    "quantite": 0,
    "prixCession": 2000,
    "prixVente": 2700,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 25,
    "no": 25,
    "designation": "Artane 2mg cp",
    "quantite": 0,
    "prixCession": 2700,
    "prixVente": 3645,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 26,
    "no": 26,
    "designation": "Artane 5mg",
    "quantite": 0,
    "prixCession": 2700,
    "prixVente": 3645,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 27,
    "no": 27,
    "designation": "Arte fan 120 disp",
    "quantite": 0,
    "prixCession": 1425,
    "prixVente": 1924,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 28,
    "no": 28,
    "designation": "Arte fan 40/240",
    "quantite": 0,
    "prixCession": 2100,
    "prixVente": 2835,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 29,
    "no": 29,
    "designation": "Arte vinc 80",
    "quantite": 0,
    "prixCession": 2000,
    "prixVente": 2700,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 30,
    "no": 30,
    "designation": "Artefan 120mg B-24",
    "quantite": 0,
    "prixCession": 2400,
    "prixVente": 3240,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 31,
    "no": 31,
    "designation": "Artefan 60/360",
    "quantite": 0,
    "prixCession": 2550,
    "prixVente": 3443,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 32,
    "no": 32,
    "designation": "Artefan 80/480",
    "quantite": 0,
    "prixCession": 2200,
    "prixVente": 2970,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 33,
    "no": 33,
    "designation": "Artemether 80mg",
    "quantite": 0,
    "prixCession": 1200,
    "prixVente": 1620,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 34,
    "no": 34,
    "designation": "Artesiane suppo",
    "quantite": 0,
    "prixCession": 2900,
    "prixVente": 3915,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 35,
    "no": 35,
    "designation": "Atenolol denk 50mg",
    "quantite": 0,
    "prixCession": 950,
    "prixVente": 1283,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 36,
    "no": 36,
    "designation": "Atmax cp",
    "quantite": 0,
    "prixCession": 4665,
    "prixVente": 6298,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 37,
    "no": 37,
    "designation": "Asmocold cp",
    "quantite": 0,
    "prixCession": 350,
    "prixVente": 473,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 38,
    "no": 38,
    "designation": "Azibact 500",
    "quantite": 0,
    "prixCession": 4825,
    "prixVente": 6514,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 39,
    "no": 39,
    "designation": "Azithro cp",
    "quantite": 0,
    "prixCession": 4825,
    "prixVente": 6514,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 40,
    "no": 40,
    "designation": "Bicarbonate de sod gelule",
    "quantite": 0,
    "prixCession": 8150,
    "prixVente": 11003,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 41,
    "no": 41,
    "designation": "Bimalaril plus",
    "quantite": 0,
    "prixCession": 3600,
    "prixVente": 4860,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 42,
    "no": 42,
    "designation": "Bimalaril 20/120",
    "quantite": 0,
    "prixCession": 1600,
    "prixVente": 2160,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 43,
    "no": 43,
    "designation": "Bimalaril 60/360",
    "quantite": 0,
    "prixCession": 3060,
    "prixVente": 4131,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 44,
    "no": 44,
    "designation": "Bimalaril 80/480",
    "quantite": 0,
    "prixCession": 2350,
    "prixVente": 3173,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 45,
    "no": 45,
    "designation": "Bimalaril40/240",
    "quantite": 0,
    "prixCession": 2650,
    "prixVente": 3578,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 46,
    "no": 46,
    "designation": "Biofar 12 vit",
    "quantite": 0,
    "prixCession": 4175,
    "prixVente": 5636,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 47,
    "no": 47,
    "designation": "Biofar calcium",
    "quantite": 0,
    "prixCession": 3960,
    "prixVente": 5346,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 48,
    "no": 48,
    "designation": "Biofar magnesium",
    "quantite": 0,
    "prixCession": 3960,
    "prixVente": 5346,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 49,
    "no": 49,
    "designation": "Biofar multivit",
    "quantite": 0,
    "prixCession": 4075,
    "prixVente": 5501,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 50,
    "no": 50,
    "designation": "Biofar vit C 500",
    "quantite": 0,
    "prixCession": 4000,
    "prixVente": 5400,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 51,
    "no": 51,
    "designation": "Bisacodyl cp",
    "quantite": 0,
    "prixCession": 200,
    "prixVente": 270,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 52,
    "no": 52,
    "designation": "Boncipro 500mg",
    "quantite": 0,
    "prixCession": 4875,
    "prixVente": 6581,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 53,
    "no": 53,
    "designation": "Cac 1000 saudoz",
    "quantite": 0,
    "prixCession": 2775,
    "prixVente": 3746,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 54,
    "no": 54,
    "designation": "Cacip cp",
    "quantite": 0,
    "prixCession": 1400,
    "prixVente": 1890,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 55,
    "no": 55,
    "designation": "Calbactive cp",
    "quantite": 0,
    "prixCession": 2650,
    "prixVente": 3578,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 56,
    "no": 56,
    "designation": "Calcheck 10",
    "quantite": 0,
    "prixCession": 3250,
    "prixVente": 4388,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 57,
    "no": 57,
    "designation": "Calcid denk cp",
    "quantite": 0,
    "prixCession": 5600,
    "prixVente": 7560,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 58,
    "no": 58,
    "designation": "calgin 500mg",
    "quantite": 0,
    "prixCession": 1050,
    "prixVente": 1418,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 59,
    "no": 59,
    "designation": "Camvit cp",
    "quantite": 0,
    "prixCession": 2550,
    "prixVente": 3443,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 60,
    "no": 60,
    "designation": "Caprazole gélule",
    "quantite": 0,
    "prixCession": 6700,
    "prixVente": 9045,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 61,
    "no": 61,
    "designation": "Capsulide cp",
    "quantite": 0,
    "prixCession": 1000,
    "prixVente": 1350,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 62,
    "no": 62,
    "designation": "Captopril 25 mg",
    "quantite": 0,
    "prixCession": 200,
    "prixVente": 270,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 63,
    "no": 63,
    "designation": "Captopril 50/25",
    "quantite": 0,
    "prixCession": 1550,
    "prixVente": 2093,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 64,
    "no": 64,
    "designation": "Captopril denk",
    "quantite": 0,
    "prixCession": 25850,
    "prixVente": 34898,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 65,
    "no": 65,
    "designation": "Captopril TM",
    "quantite": 0,
    "prixCession": 950,
    "prixVente": 1283,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 66,
    "no": 66,
    "designation": "Cardiurine cp",
    "quantite": 0,
    "prixCession": 4125,
    "prixVente": 5569,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 67,
    "no": 67,
    "designation": "Catipred cp",
    "quantite": 0,
    "prixCession": 5600,
    "prixVente": 7560,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 68,
    "no": 68,
    "designation": "Ceficap 400",
    "quantite": 0,
    "prixCession": 6560,
    "prixVente": 8856,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 69,
    "no": 69,
    "designation": "Cefim 400",
    "quantite": 0,
    "prixCession": 5950,
    "prixVente": 8033,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 70,
    "no": 70,
    "designation": "Celebid cp",
    "quantite": 0,
    "prixCession": 5700,
    "prixVente": 7695,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 71,
    "no": 71,
    "designation": "Celestene 2 mg cp",
    "quantite": 0,
    "prixCession": 3400,
    "prixVente": 4590,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 72,
    "no": 72,
    "designation": "Chondrogene cp",
    "quantite": 0,
    "prixCession": 4200,
    "prixVente": 5670,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 73,
    "no": 73,
    "designation": "Chorpheniramine cp",
    "quantite": 75,
    "prixCession": 4.32,
    "prixVente": 6,
    "seuilAlerte": 10,
    "datePeremption": "2026-11-28"
  },
  {
    "id": 74,
    "no": 74,
    "designation": "Chorpromazine 100",
    "quantite": 300,
    "prixCession": 14.92,
    "prixVente": 20,
    "seuilAlerte": 10,
    "datePeremption": "2028-08-15"
  },
  {
    "id": 75,
    "no": 75,
    "designation": "Cipranat 500",
    "quantite": 0,
    "prixCession": 4125,
    "prixVente": 5569,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 76,
    "no": 76,
    "designation": "Cipro 500",
    "quantite": 350,
    "prixCession": 23.82,
    "prixVente": 32,
    "seuilAlerte": 10,
    "datePeremption": "2028-12-31"
  },
  {
    "id": 77,
    "no": 77,
    "designation": "Cipronat 750",
    "quantite": 0,
    "prixCession": 6950,
    "prixVente": 9383,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 78,
    "no": 78,
    "designation": "Ciprozole forte",
    "quantite": 0,
    "prixCession": 6950,
    "prixVente": 9383,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 79,
    "no": 79,
    "designation": "Ciptin 250",
    "quantite": 0,
    "prixCession": 1400,
    "prixVente": 1890,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 81,
    "no": 81,
    "designation": "Ciptin forte",
    "quantite": 0,
    "prixCession": 2850,
    "prixVente": 3848,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 82,
    "no": 82,
    "designation": "Clofain cp",
    "quantite": 0,
    "prixCession": 1200,
    "prixVente": 1620,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 83,
    "no": 83,
    "designation": "Clomid B /10",
    "quantite": 0,
    "prixCession": 7850,
    "prixVente": 10598,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 84,
    "no": 84,
    "designation": "Clomid B/5",
    "quantite": 0,
    "prixCession": 3975,
    "prixVente": 5366,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 85,
    "no": 85,
    "designation": "Cloxa gelule",
    "quantite": 500,
    "prixCession": 39.54,
    "prixVente": 53,
    "seuilAlerte": 10,
    "datePeremption": "2028-02-28"
  },
  {
    "id": 86,
    "no": 86,
    "designation": "Co-Arinate cp",
    "quantite": 0,
    "prixCession": 3100,
    "prixVente": 4185,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 87,
    "no": 87,
    "designation": "Co-Arinate junior",
    "quantite": 0,
    "prixCession": 2450,
    "prixVente": 3308,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 88,
    "no": 88,
    "designation": "Cofantrine 80/480",
    "quantite": 0,
    "prixCession": 2700,
    "prixVente": 3645,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 89,
    "no": 89,
    "designation": "Combiart 80/480",
    "quantite": 0,
    "prixCession": 2300,
    "prixVente": 3105,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 90,
    "no": 90,
    "designation": "Combimal cp",
    "quantite": 0,
    "prixCession": 550,
    "prixVente": 743,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 91,
    "no": 91,
    "designation": "Complex B",
    "quantite": 700,
    "prixCession": 47.61,
    "prixVente": 64,
    "seuilAlerte": 10,
    "datePeremption": "2028-05-31"
  },
  {
    "id": 92,
    "no": 92,
    "designation": "Cotri 480",
    "quantite": 150,
    "prixCession": 9.5,
    "prixVente": 13,
    "seuilAlerte": 10,
    "datePeremption": "2027-05-15"
  },
  {
    "id": 93,
    "no": 93,
    "designation": "Cyclopam cp",
    "quantite": 0,
    "prixCession": 2150,
    "prixVente": 2903,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 94,
    "no": 94,
    "designation": "Daflon 1000mg",
    "quantite": 0,
    "prixCession": 9950,
    "prixVente": 13433,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 95,
    "no": 95,
    "designation": "Daflon 500",
    "quantite": 0,
    "prixCession": 5000,
    "prixVente": 6750,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 96,
    "no": 96,
    "designation": "Daonil B/20",
    "quantite": 0,
    "prixCession": 2000,
    "prixVente": 2700,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 97,
    "no": 97,
    "designation": "Datizole cp",
    "quantite": 0,
    "prixCession": 1050,
    "prixVente": 1418,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 98,
    "no": 98,
    "designation": "Dazel kit",
    "quantite": 0,
    "prixCession": 6950,
    "prixVente": 9383,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 99,
    "no": 99,
    "designation": "Debridat cp",
    "quantite": 0,
    "prixCession": 5500,
    "prixVente": 7425,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 100,
    "no": 100,
    "designation": "Diajepam cp",
    "quantite": 100,
    "prixCession": 6.33,
    "prixVente": 9,
    "seuilAlerte": 10,
    "datePeremption": "2027-07-20"
  },
  {
    "id": 101,
    "no": 101,
    "designation": "Diclodenk 100mg",
    "quantite": 0,
    "prixCession": 950,
    "prixVente": 1283,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 102,
    "no": 102,
    "designation": "Diclodenk 50mg",
    "quantite": 0,
    "prixCession": 550,
    "prixVente": 743,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 103,
    "no": 103,
    "designation": "Diclofenac cp",
    "quantite": 75,
    "prixCession": 3.94,
    "prixVente": 5,
    "seuilAlerte": 10,
    "datePeremption": "2028-08-15"
  },
  {
    "id": 104,
    "no": 104,
    "designation": "Diclomax 100mg cp",
    "quantite": 0,
    "prixCession": 2600,
    "prixVente": 3510,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 105,
    "no": 105,
    "designation": "Digoxine cp",
    "quantite": 0,
    "prixCession": 2270,
    "prixVente": 3065,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 106,
    "no": 106,
    "designation": "Dislep cp",
    "quantite": 0,
    "prixCession": 6650,
    "prixVente": 8978,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 107,
    "no": 107,
    "designation": "Distem cp",
    "quantite": 0,
    "prixCession": 4450,
    "prixVente": 6008,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 108,
    "no": 108,
    "designation": "Dolimex 1 000mg",
    "quantite": 0,
    "prixCession": 1200,
    "prixVente": 1620,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 109,
    "no": 109,
    "designation": "Dolimex 500g",
    "quantite": 0,
    "prixCession": 1200,
    "prixVente": 1620,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 110,
    "no": 110,
    "designation": "Dolimex migraine",
    "quantite": 0,
    "prixCession": 2650,
    "prixVente": 3578,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 111,
    "no": 111,
    "designation": "Doliprane 1 000mg",
    "quantite": 0,
    "prixCession": 1450,
    "prixVente": 1958,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 112,
    "no": 112,
    "designation": "Doliprane 500mg",
    "quantite": 0,
    "prixCession": 1250,
    "prixVente": 1688,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 113,
    "no": 113,
    "designation": "Doliprane vit C",
    "quantite": 0,
    "prixCession": 1500,
    "prixVente": 2025,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 114,
    "no": 114,
    "designation": "Doxy 200",
    "quantite": 0,
    "prixCession": 2200,
    "prixVente": 2970,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 115,
    "no": 115,
    "designation": "Doxycicline 100mg",
    "quantite": 250,
    "prixCession": 11.04,
    "prixVente": 15,
    "seuilAlerte": 10,
    "datePeremption": "2028-12-31"
  },
  {
    "id": 116,
    "no": 116,
    "designation": "Doxynor cp",
    "quantite": 0,
    "prixCession": 4300,
    "prixVente": 5805,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 117,
    "no": 117,
    "designation": "Duo-Cotexin",
    "quantite": 0,
    "prixCession": 4200,
    "prixVente": 5670,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 118,
    "no": 118,
    "designation": "Duphaston cp",
    "quantite": 0,
    "prixCession": 3175,
    "prixVente": 4286,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 119,
    "no": 119,
    "designation": "Dycinone cp",
    "quantite": 0,
    "prixCession": 5500,
    "prixVente": 7425,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 120,
    "no": 120,
    "designation": "Dynapar 100",
    "quantite": 0,
    "prixCession": 1100,
    "prixVente": 1485,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 121,
    "no": 121,
    "designation": "Dynapar 500",
    "quantite": 0,
    "prixCession": 1400,
    "prixVente": 1890,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 122,
    "no": 122,
    "designation": "Eferalgan lg",
    "quantite": 0,
    "prixCession": 1450,
    "prixVente": 1958,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 123,
    "no": 123,
    "designation": "Eferalgan cp sec 1g",
    "quantite": 0,
    "prixCession": 1950,
    "prixVente": 2633,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 124,
    "no": 124,
    "designation": "Efferalgan 500",
    "quantite": 0,
    "prixCession": 1600,
    "prixVente": 2160,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 125,
    "no": 125,
    "designation": "Efferalgan 500 cp sec",
    "quantite": 0,
    "prixCession": 1950,
    "prixVente": 2633,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 126,
    "no": 126,
    "designation": "Efferalgan codeine",
    "quantite": 0,
    "prixCession": 2400,
    "prixVente": 3240,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 127,
    "no": 127,
    "designation": "Efferalgan vit C",
    "quantite": 0,
    "prixCession": 1500,
    "prixVente": 2025,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 128,
    "no": 128,
    "designation": "Erectad c",
    "quantite": 0,
    "prixCession": 6000,
    "prixVente": 8100,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 129,
    "no": 129,
    "designation": "Ery 500 mg",
    "quantite": 600,
    "prixCession": 43.84,
    "prixVente": 59,
    "seuilAlerte": 10,
    "datePeremption": "2028-02-28"
  },
  {
    "id": 130,
    "no": 130,
    "designation": "Esopra 40mg",
    "quantite": 0,
    "prixCession": 4100,
    "prixVente": 5535,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 131,
    "no": 131,
    "designation": "Enadenk cp",
    "quantite": 0,
    "prixCession": 5450,
    "prixVente": 7358,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 132,
    "no": 132,
    "designation": "Febrex plus b/10",
    "quantite": 0,
    "prixCession": 675,
    "prixVente": 911,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 133,
    "no": 133,
    "designation": "Flexpro cp",
    "quantite": 0,
    "prixCession": 3475,
    "prixVente": 4691,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 134,
    "no": 134,
    "designation": "febrex TM",
    "quantite": 0,
    "prixCession": 1000,
    "prixVente": 1350,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 135,
    "no": 135,
    "designation": "Febrilex cp",
    "quantite": 0,
    "prixCession": 400,
    "prixVente": 540,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 136,
    "no": 136,
    "designation": "Fedate gélule",
    "quantite": 0,
    "prixCession": 2650,
    "prixVente": 3578,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 137,
    "no": 137,
    "designation": "Fer cp",
    "quantite": 75,
    "prixCession": 3.2,
    "prixVente": 4,
    "seuilAlerte": 10,
    "datePeremption": "2028-05-31"
  },
  {
    "id": 138,
    "no": 138,
    "designation": "Fercefol cp",
    "quantite": 0,
    "prixCession": 1600,
    "prixVente": 2160,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 139,
    "no": 139,
    "designation": "Fezomin C",
    "quantite": 0,
    "prixCession": 2650,
    "prixVente": 3578,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 140,
    "no": 140,
    "designation": "Fixim 200",
    "quantite": 0,
    "prixCession": 5900,
    "prixVente": 7965,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 141,
    "no": 141,
    "designation": "Flagyl 500",
    "quantite": 0,
    "prixCession": 2300,
    "prixVente": 3105,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 142,
    "no": 142,
    "designation": "Flagyl 500mg ovul",
    "quantite": 0,
    "prixCession": 2550,
    "prixVente": 3443,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 143,
    "no": 143,
    "designation": "Fleming lg",
    "quantite": 0,
    "prixCession": 6275,
    "prixVente": 8471,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 144,
    "no": 144,
    "designation": "Fleming 500",
    "quantite": 0,
    "prixCession": 4125,
    "prixVente": 5569,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 145,
    "no": 145,
    "designation": "Flucap b/1",
    "quantite": 0,
    "prixCession": 1850,
    "prixVente": 2498,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 146,
    "no": 146,
    "designation": "Flucazo gélule",
    "quantite": 0,
    "prixCession": 2600,
    "prixVente": 3510,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 147,
    "no": 147,
    "designation": "Fludol gélule",
    "quantite": 0,
    "prixCession": 550,
    "prixVente": 743,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 148,
    "no": 148,
    "designation": "Flucomy cp",
    "quantite": 0,
    "prixCession": 400,
    "prixVente": 540,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 149,
    "no": 149,
    "designation": "Fuclo cp",
    "quantite": 0,
    "prixCession": 4250,
    "prixVente": 5738,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 150,
    "no": 150,
    "designation": "Furo cp",
    "quantite": 125,
    "prixCession": 6.27,
    "prixVente": 8,
    "seuilAlerte": 10,
    "datePeremption": "2026-12-15"
  },
  {
    "id": 151,
    "no": 151,
    "designation": "Furo denk",
    "quantite": 0,
    "prixCession": 750,
    "prixVente": 1013,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 152,
    "no": 152,
    "designation": "Galocide",
    "quantite": 0,
    "prixCession": 4200,
    "prixVente": 5670,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 153,
    "no": 153,
    "designation": "Gaspral B/14",
    "quantite": 0,
    "prixCession": 3150,
    "prixVente": 4253,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 154,
    "no": 154,
    "designation": "Gastricide cp",
    "quantite": 0,
    "prixCession": 650,
    "prixVente": 878,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 155,
    "no": 155,
    "designation": "Genset cp",
    "quantite": 0,
    "prixCession": 2800,
    "prixVente": 3780,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 156,
    "no": 156,
    "designation": "Gestid cp",
    "quantite": 0,
    "prixCession": 1050,
    "prixVente": 1418,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 157,
    "no": 157,
    "designation": "Ginkort fort",
    "quantite": 0,
    "prixCession": 7650,
    "prixVente": 10328,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 158,
    "no": 158,
    "designation": "Glim forte cp",
    "quantite": 0,
    "prixCession": 6950,
    "prixVente": 9383,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 159,
    "no": 159,
    "designation": "Glucophage 1000",
    "quantite": 0,
    "prixCession": 3500,
    "prixVente": 4725,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 160,
    "no": 160,
    "designation": "Glucophage 500",
    "quantite": 0,
    "prixCession": 1225,
    "prixVente": 1654,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 161,
    "no": 161,
    "designation": "Glucophage 850",
    "quantite": 0,
    "prixCession": 3285,
    "prixVente": 4435,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 162,
    "no": 162,
    "designation": "Griseo 250 mg",
    "quantite": 600,
    "prixCession": 40.19,
    "prixVente": 54,
    "seuilAlerte": 10,
    "datePeremption": "2027-01-05"
  },
  {
    "id": 163,
    "no": 163,
    "designation": "Griseo 250 mg TM",
    "quantite": 0,
    "prixCession": 1200,
    "prixVente": 1620,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 164,
    "no": 164,
    "designation": "Griseo 500",
    "quantite": 0,
    "prixCession": 3200,
    "prixVente": 4320,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 165,
    "no": 165,
    "designation": "Gynanfort ovul",
    "quantite": 0,
    "prixCession": 3000,
    "prixVente": 4050,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 166,
    "no": 166,
    "designation": "Gynomax b/12",
    "quantite": 0,
    "prixCession": 4900,
    "prixVente": 6615,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 167,
    "no": 167,
    "designation": "Gynomax b/6",
    "quantite": 0,
    "prixCession": 3400,
    "prixVente": 4590,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 168,
    "no": 168,
    "designation": "Helmintox sachet",
    "quantite": 0,
    "prixCession": 1350,
    "prixVente": 1823,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 169,
    "no": 169,
    "designation": "Haldol cp",
    "quantite": 0,
    "prixCession": 2750,
    "prixVente": 3713,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 170,
    "no": 170,
    "designation": "Hemafer cp",
    "quantite": 0,
    "prixCession": 5900,
    "prixVente": 7965,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 171,
    "no": 171,
    "designation": "Hemafer cp efferv",
    "quantite": 0,
    "prixCession": 4550,
    "prixVente": 6143,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 172,
    "no": 172,
    "designation": "Humex rhume",
    "quantite": 0,
    "prixCession": 2250,
    "prixVente": 3038,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 173,
    "no": 173,
    "designation": "Ibu 400",
    "quantite": 150,
    "prixCession": 7.96,
    "prixVente": 11,
    "seuilAlerte": 10,
    "datePeremption": "2028-08-15"
  },
  {
    "id": 174,
    "no": 174,
    "designation": "Ibumol b/30",
    "quantite": 0,
    "prixCession": 3150,
    "prixVente": 4253,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 175,
    "no": 175,
    "designation": "Imodium cp",
    "quantite": 0,
    "prixCession": 2400,
    "prixVente": 3240,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 176,
    "no": 176,
    "designation": "Inflacam cp",
    "quantite": 0,
    "prixCession": 2700,
    "prixVente": 3645,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 177,
    "no": 177,
    "designation": "Kaleorid cp",
    "quantite": 0,
    "prixCession": 1950,
    "prixVente": 2633,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 178,
    "no": 178,
    "designation": "Kilpal 300mg",
    "quantite": 0,
    "prixCession": 1550,
    "prixVente": 2093,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 179,
    "no": 179,
    "designation": "Klipal codeîne 600mg",
    "quantite": 0,
    "prixCession": 2350,
    "prixVente": 3173,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 180,
    "no": 180,
    "designation": "KNZ-200",
    "quantite": 0,
    "prixCession": 2700,
    "prixVente": 3645,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 181,
    "no": 181,
    "designation": "Lanzocap gelule",
    "quantite": 0,
    "prixCession": 7375,
    "prixVente": 9956,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 182,
    "no": 182,
    "designation": "Laridox cp",
    "quantite": 0,
    "prixCession": 550,
    "prixVente": 743,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 183,
    "no": 183,
    "designation": "Laritem 20/120",
    "quantite": 0,
    "prixCession": 2400,
    "prixVente": 3240,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 184,
    "no": 184,
    "designation": "Laritem 40/240",
    "quantite": 0,
    "prixCession": 2400,
    "prixVente": 3240,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 185,
    "no": 185,
    "designation": "Laritem 80/480",
    "quantite": 0,
    "prixCession": 1850,
    "prixVente": 2498,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 186,
    "no": 186,
    "designation": "Laroxyl 25 mg",
    "quantite": 0,
    "prixCession": 3925,
    "prixVente": 5299,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 187,
    "no": 187,
    "designation": "Lasilix 40",
    "quantite": 0,
    "prixCession": 2750,
    "prixVente": 3713,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 188,
    "no": 188,
    "designation": "Lerin cp",
    "quantite": 0,
    "prixCession": 3900,
    "prixVente": 5265,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 189,
    "no": 189,
    "designation": "Levopred cp",
    "quantite": 0,
    "prixCession": 2225,
    "prixVente": 3004,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 190,
    "no": 190,
    "designation": "Lexomil roche",
    "quantite": 0,
    "prixCession": 3600,
    "prixVente": 4860,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 191,
    "no": 191,
    "designation": "L-Gest cp",
    "quantite": 0,
    "prixCession": 2000,
    "prixVente": 2700,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 192,
    "no": 192,
    "designation": "Lincomicine gélule",
    "quantite": 0,
    "prixCession": 1100,
    "prixVente": 1485,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 193,
    "no": 193,
    "designation": "Litacold cp",
    "quantite": 0,
    "prixCession": 300,
    "prixVente": 405,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 194,
    "no": 194,
    "designation": "Lorhist cp",
    "quantite": 0,
    "prixCession": 2200,
    "prixVente": 2970,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 195,
    "no": 195,
    "designation": "Larinol 10mg",
    "quantite": 0,
    "prixCession": 1800,
    "prixVente": 2430,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 196,
    "no": 196,
    "designation": "Maalox cp",
    "quantite": 0,
    "prixCession": 2400,
    "prixVente": 3240,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 197,
    "no": 197,
    "designation": "Madar cp",
    "quantite": 0,
    "prixCession": 500,
    "prixVente": 675,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 198,
    "no": 198,
    "designation": "Mag cp",
    "quantite": 0,
    "prixCession": 4250,
    "prixVente": 5738,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 199,
    "no": 199,
    "designation": "Malacur cp b/12",
    "quantite": 0,
    "prixCession": 3900,
    "prixVente": 5265,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 200,
    "no": 200,
    "designation": "Malacur cp b/9",
    "quantite": 0,
    "prixCession": 3650,
    "prixVente": 4928,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 201,
    "no": 201,
    "designation": "Maloxine cp",
    "quantite": 0,
    "prixCession": 650,
    "prixVente": 878,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 202,
    "no": 202,
    "designation": "Mebendazol cp",
    "quantite": 100,
    "prixCession": 6.07,
    "prixVente": 8,
    "seuilAlerte": 10,
    "datePeremption": "2027-01-20"
  },
  {
    "id": 203,
    "no": 203,
    "designation": "Medrol-16",
    "quantite": 0,
    "prixCession": 5250,
    "prixVente": 7088,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 204,
    "no": 204,
    "designation": "Meteospasmyl cp",
    "quantite": 0,
    "prixCession": 3350,
    "prixVente": 4523,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 205,
    "no": 205,
    "designation": "Metformine denk",
    "quantite": 0,
    "prixCession": 1100,
    "prixVente": 1485,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 206,
    "no": 206,
    "designation": "Metheoxane gélule",
    "quantite": 0,
    "prixCession": 3100,
    "prixVente": 4185,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 207,
    "no": 207,
    "designation": "Metro 250",
    "quantite": 100,
    "prixCession": 4.95,
    "prixVente": 7,
    "seuilAlerte": 10,
    "datePeremption": "2028-12-31"
  },
  {
    "id": 208,
    "no": 208,
    "designation": "Metro 500",
    "quantite": 200,
    "prixCession": 68.61,
    "prixVente": 93,
    "seuilAlerte": 10,
    "datePeremption": "2027-08-30"
  },
  {
    "id": 209,
    "no": 209,
    "designation": "Mepacolon",
    "quantite": 0,
    "prixCession": 2000,
    "prixVente": 2700,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 210,
    "no": 210,
    "designation": "Mepafloxacin",
    "quantite": 0,
    "prixCession": 5100,
    "prixVente": 6885,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 211,
    "no": 211,
    "designation": "Metaren cp",
    "quantite": 0,
    "prixCession": 1475,
    "prixVente": 1991,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 212,
    "no": 212,
    "designation": "Metformin GH",
    "quantite": 0,
    "prixCession": 700,
    "prixVente": 945,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 213,
    "no": 213,
    "designation": "Microgynon cp",
    "quantite": 0,
    "prixCession": 625,
    "prixVente": 844,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 214,
    "no": 214,
    "designation": "Microlax cp",
    "quantite": 0,
    "prixCession": 8200,
    "prixVente": 11070,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 215,
    "no": 215,
    "designation": "Migretil",
    "quantite": 0,
    "prixCession": 2700,
    "prixVente": 3645,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 216,
    "no": 216,
    "designation": "Miorel cp",
    "quantite": 0,
    "prixCession": 3250,
    "prixVente": 4388,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 217,
    "no": 217,
    "designation": "Miseoclear b/10",
    "quantite": 0,
    "prixCession": 2950,
    "prixVente": 3983,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 218,
    "no": 218,
    "designation": "Misodia cp",
    "quantite": 0,
    "prixCession": 1300,
    "prixVente": 1755,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 219,
    "no": 219,
    "designation": "Nauselium cp",
    "quantite": 0,
    "prixCession": 2300,
    "prixVente": 3105,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 220,
    "no": 220,
    "designation": "Nebzol D",
    "quantite": 0,
    "prixCession": 8025,
    "prixVente": 10834,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 221,
    "no": 221,
    "designation": "Neo codion cp",
    "quantite": 0,
    "prixCession": 1700,
    "prixVente": 2295,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 222,
    "no": 222,
    "designation": "Nifedidendenk",
    "quantite": 0,
    "prixCession": 20850,
    "prixVente": 28148,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 223,
    "no": 223,
    "designation": "Nifedipine 20mg TM",
    "quantite": 0,
    "prixCession": 400,
    "prixVente": 540,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 224,
    "no": 224,
    "designation": "Nifluril gélule",
    "quantite": 0,
    "prixCession": 2350,
    "prixVente": 3173,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 225,
    "no": 225,
    "designation": "Nim 100",
    "quantite": 0,
    "prixCession": 4250,
    "prixVente": 5738,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 226,
    "no": 226,
    "designation": "Norlevo cp",
    "quantite": 0,
    "prixCession": 4050,
    "prixVente": 5468,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 227,
    "no": 227,
    "designation": "Nosic cp",
    "quantite": 0,
    "prixCession": 2000,
    "prixVente": 2700,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 228,
    "no": 228,
    "designation": "Novalgin cp",
    "quantite": 0,
    "prixCession": 1800,
    "prixVente": 2430,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 229,
    "no": 229,
    "designation": "Nozinan cp",
    "quantite": 0,
    "prixCession": 3600,
    "prixVente": 4860,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 230,
    "no": 230,
    "designation": "Nucleo CMP",
    "quantite": 0,
    "prixCession": 6700,
    "prixVente": 9045,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 231,
    "no": 231,
    "designation": "Nurabol cp",
    "quantite": 0,
    "prixCession": 2750,
    "prixVente": 3713,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 232,
    "no": 232,
    "designation": "Ocuguard cp",
    "quantite": 0,
    "prixCession": 6650,
    "prixVente": 8978,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 233,
    "no": 233,
    "designation": "Omeprazol gel",
    "quantite": 200,
    "prixCession": 10.09,
    "prixVente": 14,
    "seuilAlerte": 10,
    "datePeremption": "2028-02-28"
  },
  {
    "id": 234,
    "no": 234,
    "designation": "Ospen cp",
    "quantite": 0,
    "prixCession": 2950,
    "prixVente": 3983,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 235,
    "no": 235,
    "designation": "Oxyboldine cp",
    "quantite": 0,
    "prixCession": 2900,
    "prixVente": 3915,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 236,
    "no": 236,
    "designation": "Para cp",
    "quantite": 100,
    "prixCession": 4.33,
    "prixVente": 6,
    "seuilAlerte": 10,
    "datePeremption": "2027-10-14"
  },
  {
    "id": 237,
    "no": 237,
    "designation": "Peni V 250",
    "quantite": 200,
    "prixCession": 12.02,
    "prixVente": 16,
    "seuilAlerte": 10,
    "datePeremption": "2028-05-31"
  },
  {
    "id": 238,
    "no": 238,
    "designation": "Phenergan cp",
    "quantite": 0,
    "prixCession": 1300,
    "prixVente": 1755,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 239,
    "no": 239,
    "designation": "Phenobarbital cp",
    "quantite": 450,
    "prixCession": 31.25,
    "prixVente": 42,
    "seuilAlerte": 10,
    "datePeremption": "2028-08-15"
  },
  {
    "id": 240,
    "no": 240,
    "designation": "Phloro cp",
    "quantite": 675,
    "prixCession": 45.91,
    "prixVente": 62,
    "seuilAlerte": 10,
    "datePeremption": "2027-11-30"
  },
  {
    "id": 241,
    "no": 241,
    "designation": "Plufantrine 20/120",
    "quantite": 0,
    "prixCession": 900,
    "prixVente": 1215,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 242,
    "no": 242,
    "designation": "Plufantrine 40/240",
    "quantite": 0,
    "prixCession": 1500,
    "prixVente": 2025,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 243,
    "no": 243,
    "designation": "Plufantrine 80/480",
    "quantite": 0,
    "prixCession": 2400,
    "prixVente": 3240,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 244,
    "no": 244,
    "designation": "Polygynax B/12",
    "quantite": 0,
    "prixCession": 5150,
    "prixVente": 6953,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 245,
    "no": 245,
    "designation": "Polygynax B/6",
    "quantite": 0,
    "prixCession": 3000,
    "prixVente": 4050,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 246,
    "no": 246,
    "designation": "Predni-20",
    "quantite": 0,
    "prixCession": 3175,
    "prixVente": 4286,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 247,
    "no": 247,
    "designation": "Prilalan cp 5mg",
    "quantite": 0,
    "prixCession": 3100,
    "prixVente": 4185,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 248,
    "no": 248,
    "designation": "Primalan 10mg",
    "quantite": 0,
    "prixCession": 4900,
    "prixVente": 6615,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 249,
    "no": 249,
    "designation": "Primolut cp",
    "quantite": 0,
    "prixCession": 2400,
    "prixVente": 3240,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 250,
    "no": 250,
    "designation": "Princ-B forte",
    "quantite": 0,
    "prixCession": 5500,
    "prixVente": 7425,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 251,
    "no": 251,
    "designation": "Procomil cp",
    "quantite": 0,
    "prixCession": 6200,
    "prixVente": 8370,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 252,
    "no": 252,
    "designation": "Profenid 100",
    "quantite": 0,
    "prixCession": 3750,
    "prixVente": 5063,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 253,
    "no": 253,
    "designation": "Profenid 50",
    "quantite": 0,
    "prixCession": 2750,
    "prixVente": 3713,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 254,
    "no": 254,
    "designation": "Profkefen 100mg",
    "quantite": 0,
    "prixCession": 1600,
    "prixVente": 2160,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 255,
    "no": 255,
    "designation": "QX 300",
    "quantite": 550,
    "prixCession": 37.42,
    "prixVente": 51,
    "seuilAlerte": 10,
    "datePeremption": "2028-12-31"
  },
  {
    "id": 256,
    "no": 256,
    "designation": "Rapiclav lg",
    "quantite": 0,
    "prixCession": 6235,
    "prixVente": 8417,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 257,
    "no": 257,
    "designation": "Renerve",
    "quantite": 0,
    "prixCession": 12500,
    "prixVente": 16875,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 258,
    "no": 258,
    "designation": "Restriva cp",
    "quantite": 0,
    "prixCession": 1700,
    "prixVente": 2295,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 259,
    "no": 259,
    "designation": "Rhumagrip cp",
    "quantite": 0,
    "prixCession": 1600,
    "prixVente": 2160,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 260,
    "no": 260,
    "designation": "Saniver",
    "quantite": 0,
    "prixCession": 500,
    "prixVente": 675,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 261,
    "no": 261,
    "designation": "Salbutamol cp",
    "quantite": 0,
    "prixCession": 75,
    "prixVente": 101,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 262,
    "no": 262,
    "designation": "Saridon cp",
    "quantite": 0,
    "prixCession": 1300,
    "prixVente": 1755,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 263,
    "no": 263,
    "designation": "Sedaspir cp",
    "quantite": 0,
    "prixCession": 2300,
    "prixVente": 3105,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 264,
    "no": 264,
    "designation": "Spasmo Apotel cp",
    "quantite": 0,
    "prixCession": 4700,
    "prixVente": 6345,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 265,
    "no": 265,
    "designation": "Spasfan cp",
    "quantite": 0,
    "prixCession": 2250,
    "prixVente": 3038,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 266,
    "no": 266,
    "designation": "Super cal zinc",
    "quantite": 0,
    "prixCession": 4125,
    "prixVente": 5569,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 267,
    "no": 267,
    "designation": "Stresam",
    "quantite": 0,
    "prixCession": 2450,
    "prixVente": 3308,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 268,
    "no": 268,
    "designation": "Strimol extra cp",
    "quantite": 0,
    "prixCession": 2350,
    "prixVente": 3173,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 269,
    "no": 269,
    "designation": "Tanakan cp",
    "quantite": 0,
    "prixCession": 6130,
    "prixVente": 8276,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 270,
    "no": 270,
    "designation": "Tanganil cp",
    "quantite": 0,
    "prixCession": 4100,
    "prixVente": 5535,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 271,
    "no": 271,
    "designation": "Tegretol 200",
    "quantite": 0,
    "prixCession": 3950,
    "prixVente": 5333,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 272,
    "no": 272,
    "designation": "Tegretol cp 400",
    "quantite": 0,
    "prixCession": 7400,
    "prixVente": 9990,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 273,
    "no": 273,
    "designation": "Temesta cp",
    "quantite": 0,
    "prixCession": 2780,
    "prixVente": 3753,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 274,
    "no": 274,
    "designation": "Tensionorme cp",
    "quantite": 0,
    "prixCession": 1700,
    "prixVente": 2295,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 275,
    "no": 275,
    "designation": "Tergynan ovule",
    "quantite": 0,
    "prixCession": 3350,
    "prixVente": 4523,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 276,
    "no": 276,
    "designation": "Terpine codeïne",
    "quantite": 300,
    "prixCession": 20.79,
    "prixVente": 28,
    "seuilAlerte": 10,
    "datePeremption": "2027-05-15"
  },
  {
    "id": 277,
    "no": 277,
    "designation": "Thibactin 500",
    "quantite": 0,
    "prixCession": 9025,
    "prixVente": 12184,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 278,
    "no": 278,
    "designation": "Ticasse 1g",
    "quantite": 0,
    "prixCession": 5500,
    "prixVente": 7425,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 279,
    "no": 279,
    "designation": "Trabar gel",
    "quantite": 0,
    "prixCession": 3060,
    "prixVente": 4131,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 280,
    "no": 280,
    "designation": "Tracedol cp",
    "quantite": 0,
    "prixCession": 4125,
    "prixVente": 5569,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 281,
    "no": 281,
    "designation": "Tramad denk",
    "quantite": 0,
    "prixCession": 2600,
    "prixVente": 3510,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 282,
    "no": 282,
    "designation": "Tramadis cp",
    "quantite": 0,
    "prixCession": 3700,
    "prixVente": 4995,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 283,
    "no": 283,
    "designation": "Tramagen cp",
    "quantite": 0,
    "prixCession": 3000,
    "prixVente": 4050,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 284,
    "no": 284,
    "designation": "Tranxene 10mg",
    "quantite": 0,
    "prixCession": 2550,
    "prixVente": 3443,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 285,
    "no": 285,
    "designation": "Très Orix cp",
    "quantite": 0,
    "prixCession": 3560,
    "prixVente": 4806,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 286,
    "no": 286,
    "designation": "Tributine gélule",
    "quantite": 0,
    "prixCession": 3950,
    "prixVente": 5333,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 287,
    "no": 287,
    "designation": "Trofocard sch",
    "quantite": 0,
    "prixCession": 5900,
    "prixVente": 7965,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 288,
    "no": 288,
    "designation": "Upsac 1000",
    "quantite": 0,
    "prixCession": 1225,
    "prixVente": 1654,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 289,
    "no": 289,
    "designation": "Viceralgin cp",
    "quantite": 0,
    "prixCession": 2200,
    "prixVente": 2970,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 290,
    "no": 290,
    "designation": "Vinclave 1g",
    "quantite": 0,
    "prixCession": 7300,
    "prixVente": 9855,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 291,
    "no": 291,
    "designation": "Vit B denk",
    "quantite": 0,
    "prixCession": 850,
    "prixVente": 1148,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 292,
    "no": 292,
    "designation": "Vitac 1000",
    "quantite": 0,
    "prixCession": 1100,
    "prixVente": 1485,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 293,
    "no": 293,
    "designation": "Vitafer gelule",
    "quantite": 0,
    "prixCession": 2650,
    "prixVente": 3578,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 294,
    "no": 294,
    "designation": "Vitamin E forte",
    "quantite": 0,
    "prixCession": 3100,
    "prixVente": 4185,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 295,
    "no": 295,
    "designation": "Warimazol ovule",
    "quantite": 0,
    "prixCession": 2350,
    "prixVente": 3173,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 296,
    "no": 296,
    "designation": "Xykaa 1g",
    "quantite": 0,
    "prixCession": 3050,
    "prixVente": 4118,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 297,
    "no": 297,
    "designation": "Zerodol cp B/10",
    "quantite": 0,
    "prixCession": 3475,
    "prixVente": 4691,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 298,
    "no": 298,
    "designation": "Zerodol b/30",
    "quantite": 0,
    "prixCession": 8850,
    "prixVente": 11948,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 299,
    "no": 299,
    "designation": "Zerodol CR b/30",
    "quantite": 0,
    "prixCession": 8330,
    "prixVente": 11246,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 300,
    "no": 300,
    "designation": "Zyloric 100",
    "quantite": 0,
    "prixCession": 1600,
    "prixVente": 2160,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 301,
    "no": 301,
    "designation": "Zyloric 200",
    "quantite": 0,
    "prixCession": 2500,
    "prixVente": 3375,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 302,
    "no": 302,
    "designation": "Zyloric 300mg",
    "quantite": 0,
    "prixCession": 2800,
    "prixVente": 3780,
    "seuilAlerte": 10,
    "datePeremption": ""
  },
  {
    "id": 303,
    "no": 303,
    "designation": "Zerodol p",
    "quantite": 0,
    "prixCession": 2800,
    "prixVente": 3780,
    "seuilAlerte": 10,
    "datePeremption": ""
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "mvt-1",
    date: "2026-11-08T09:15:00.000Z",
    type: "entree",
    productId: 8,
    productName: "Albendazol",
    quantite: 50,
    stockApres: 50,
    note: "Inventaire initial - lot 24B08"
  },
  {
    id: "mvt-2",
    date: "2026-11-08T10:30:00.000Z",
    type: "entree",
    productId: 10,
    productName: "Aluminium H",
    quantite: 100,
    stockApres: 100,
    note: "Inventaire initial - lot 24C12"
  },
  {
    id: "mvt-3",
    date: "2026-11-09T08:00:00.000Z",
    type: "ajustement",
    productId: 76,
    productName: "Cipro 500",
    quantite: 350,
    stockApres: 350,
    note: "Rapprochement inventaire physique comprimés"
  }
];
