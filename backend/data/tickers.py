IDX_TICKERS = [
    # Banking
    {"ticker": "BBCA.JK", "name": "Bank Central Asia", "sector": "Banking"},
    {"ticker": "BBRI.JK", "name": "Bank Rakyat Indonesia", "sector": "Banking"},
    {"ticker": "BMRI.JK", "name": "Bank Mandiri", "sector": "Banking"},
    {"ticker": "BBNI.JK", "name": "Bank Negara Indonesia", "sector": "Banking"},
    {"ticker": "BRIS.JK", "name": "Bank Syariah Indonesia", "sector": "Banking"},
    {"ticker": "BNGA.JK", "name": "Bank CIMB Niaga", "sector": "Banking"},
    {"ticker": "NISP.JK", "name": "Bank OCBC NISP", "sector": "Banking"},
    {"ticker": "BDMN.JK", "name": "Bank Danamon", "sector": "Banking"},
    {"ticker": "PNBN.JK", "name": "Bank Pan Indonesia", "sector": "Banking"},
    {"ticker": "BBTN.JK", "name": "Bank Tabungan Negara", "sector": "Banking"},
    {"ticker": "BTPS.JK", "name": "Bank BTPN Syariah", "sector": "Banking"},
    # Telecom
    {"ticker": "TLKM.JK", "name": "Telkom Indonesia", "sector": "Telecom"},
    {"ticker": "EXCL.JK", "name": "XL Axiata", "sector": "Telecom"},
    {"ticker": "ISAT.JK", "name": "Indosat Ooredoo Hutchison", "sector": "Telecom"},
    {"ticker": "TOWR.JK", "name": "Sarana Menara Nusantara", "sector": "Telecom"},
    {"ticker": "TBIG.JK", "name": "Tower Bersama Infrastructure", "sector": "Telecom"},
    # Consumer Goods
    {"ticker": "UNVR.JK", "name": "Unilever Indonesia", "sector": "Consumer"},
    {"ticker": "ICBP.JK", "name": "Indofood CBP Sukses Makmur", "sector": "Consumer"},
    {"ticker": "INDF.JK", "name": "Indofood Sukses Makmur", "sector": "Consumer"},
    {"ticker": "MYOR.JK", "name": "Mayora Indah", "sector": "Consumer"},
    {"ticker": "GGRM.JK", "name": "Gudang Garam", "sector": "Consumer"},
    {"ticker": "HMSP.JK", "name": "HM Sampoerna", "sector": "Consumer"},
    {"ticker": "SIDO.JK", "name": "Industri Jamu Sido Muncul", "sector": "Consumer"},
    {"ticker": "ULTJ.JK", "name": "Ultra Jaya Milk", "sector": "Consumer"},
    {"ticker": "CLEO.JK", "name": "Sariguna Primatirta", "sector": "Consumer"},
    # Automotive
    {"ticker": "ASII.JK", "name": "Astra International", "sector": "Automotive"},
    {"ticker": "UNTR.JK", "name": "United Tractors", "sector": "Automotive"},
    {"ticker": "AUTO.JK", "name": "Astra Otoparts", "sector": "Automotive"},
    # Mining & Energy
    {"ticker": "ADRO.JK", "name": "Adaro Energy Indonesia", "sector": "Mining"},
    {"ticker": "PTBA.JK", "name": "Bukit Asam", "sector": "Mining"},
    {"ticker": "ITMG.JK", "name": "Indo Tambangraya Megah", "sector": "Mining"},
    {"ticker": "INCO.JK", "name": "Vale Indonesia", "sector": "Mining"},
    {"ticker": "ANTM.JK", "name": "Aneka Tambang", "sector": "Mining"},
    {"ticker": "TINS.JK", "name": "Timah", "sector": "Mining"},
    {"ticker": "HRUM.JK", "name": "Harum Energy", "sector": "Mining"},
    {"ticker": "MEDC.JK", "name": "Medco Energi Internasional", "sector": "Energy"},
    {"ticker": "PGAS.JK", "name": "Perusahaan Gas Negara", "sector": "Energy"},
    # Plantation
    {"ticker": "AALI.JK", "name": "Astra Agro Lestari", "sector": "Plantation"},
    {"ticker": "LSIP.JK", "name": "PP London Sumatra Indonesia", "sector": "Plantation"},
    {"ticker": "SIMP.JK", "name": "Salim Ivomas Pratama", "sector": "Plantation"},
    {"ticker": "SSMS.JK", "name": "Sawit Sumbermas Sarana", "sector": "Plantation"},
    # Infrastructure & Construction
    {"ticker": "JSMR.JK", "name": "Jasa Marga", "sector": "Infrastructure"},
    {"ticker": "WIKA.JK", "name": "Wijaya Karya", "sector": "Infrastructure"},
    {"ticker": "WSKT.JK", "name": "Waskita Karya", "sector": "Infrastructure"},
    {"ticker": "PTPP.JK", "name": "PP Persero", "sector": "Infrastructure"},
    {"ticker": "ADHI.JK", "name": "Adhi Karya", "sector": "Infrastructure"},
    # Property
    {"ticker": "BSDE.JK", "name": "Bumi Serpong Damai", "sector": "Property"},
    {"ticker": "CTRA.JK", "name": "Ciputra Development", "sector": "Property"},
    {"ticker": "PWON.JK", "name": "Pakuwon Jati", "sector": "Property"},
    {"ticker": "SMRA.JK", "name": "Summarecon Agung", "sector": "Property"},
    {"ticker": "LPKR.JK", "name": "Lippo Karawaci", "sector": "Property"},
    # Healthcare & Pharma
    {"ticker": "KLBF.JK", "name": "Kalbe Farma", "sector": "Healthcare"},
    {"ticker": "KAEF.JK", "name": "Kimia Farma", "sector": "Healthcare"},
    {"ticker": "MIKA.JK", "name": "Mitra Keluarga Karyasehat", "sector": "Healthcare"},
    {"ticker": "SILO.JK", "name": "Siloam International Hospitals", "sector": "Healthcare"},
    {"ticker": "HEAL.JK", "name": "Medikaloka Hermina", "sector": "Healthcare"},
    # Technology
    {"ticker": "EMTK.JK", "name": "Elang Mahkota Teknologi", "sector": "Technology"},
    {"ticker": "GOTO.JK", "name": "GoTo Gojek Tokopedia", "sector": "Technology"},
    {"ticker": "BUKA.JK", "name": "Bukalapak", "sector": "Technology"},
    {"ticker": "LINK.JK", "name": "Link Net", "sector": "Technology"},
    # Retail
    {"ticker": "ACES.JK", "name": "Ace Hardware Indonesia", "sector": "Retail"},
    {"ticker": "MAPI.JK", "name": "Mitra Adiperkasa", "sector": "Retail"},
    {"ticker": "AMRT.JK", "name": "Sumber Alfaria Trijaya", "sector": "Retail"},
    {"ticker": "MIDI.JK", "name": "Midi Utama Indonesia", "sector": "Retail"},
    {"ticker": "RALS.JK", "name": "Ramayana Lestari Sentosa", "sector": "Retail"},
    {"ticker": "LPPF.JK", "name": "Matahari Department Store", "sector": "Retail"},
    {"ticker": "ERAA.JK", "name": "Erajaya Swasembada", "sector": "Retail"},
    # Materials & Cement
    {"ticker": "SMGR.JK", "name": "Semen Indonesia", "sector": "Materials"},
    {"ticker": "INTP.JK", "name": "Indocement Tunggal Prakarsa", "sector": "Materials"},
    {"ticker": "TPIA.JK", "name": "Chandra Asri Petrochemical", "sector": "Materials"},
    {"ticker": "BRPT.JK", "name": "Barito Pacific", "sector": "Materials"},
    # Finance (non-bank)
    {"ticker": "ADMF.JK", "name": "Adira Dinamika Multi Finance", "sector": "Finance"},
    {"ticker": "BFIN.JK", "name": "BFI Finance Indonesia", "sector": "Finance"},
    # Media
    {"ticker": "SCMA.JK", "name": "Surya Citra Media", "sector": "Media"},
    {"ticker": "MNCN.JK", "name": "Media Nusantara Citra", "sector": "Media"},
    # Agriculture (Poultry)
    {"ticker": "CPIN.JK", "name": "Charoen Pokphand Indonesia", "sector": "Agriculture"},
    {"ticker": "JPFA.JK", "name": "Japfa Comfeed Indonesia", "sector": "Agriculture"},
    {"ticker": "MAIN.JK", "name": "Malindo Feedmill", "sector": "Agriculture"},
    # Transport
    {"ticker": "BIRD.JK", "name": "Blue Bird", "sector": "Transport"},
    {"ticker": "SMDR.JK", "name": "Samudera Indonesia", "sector": "Transport"},
]

TICKER_SYMBOLS = [t["ticker"] for t in IDX_TICKERS]
TICKER_MAP = {t["ticker"]: t for t in IDX_TICKERS}
SECTORS = sorted(set(t["sector"] for t in IDX_TICKERS))
