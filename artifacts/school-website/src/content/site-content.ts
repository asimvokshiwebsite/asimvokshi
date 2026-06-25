/**
 * Admin-friendly static content file.
 *
 * Edit this file directly in code to update website content. There is no backend,
 * CMS, database, or automatic frontend editing mechanism. Images and videos should
 * live in `client/public/images` and `client/public/videos`, then be referenced
 * with paths like `/images/file.jpeg` or `/videos/file.mp4`.
 */

export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string | null;
  publishedAt: string;
  featured?: boolean | null;
}

export interface NewsListParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface NewsListResponse {
  items: NewsItem[];
  total: number;
  page: number;
  limit: number;
  categories: string[];
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  department: string;
  bio: string;
  email?: string | null;
  yearsExperience?: number | null;
}

export interface StaffListParams {
  search?: string;
  department?: string;
}

export interface StaffListResponse {
  items: StaffMember[];
  departments: string[];
}

export const schoolInfo = {
  name: "Shkolla e Mesme me Orientim Gjuhësor Asim Vokshi",
  shortName: "Asim Vokshi",
  location: "Tiranë, Shqipëri",
  founded: "15 shtator 1965",
  focus: "Arsim gjuhësor, kulturor dhe akademik për nxënësit e arsimit të mesëm.",
};

// =============================================================================
// IMAGES
// =============================================================================

export const siteImages = {
  building_front:
    "/images/building_front.jpeg",
  class_interactive:
    "/images/class_interactive.jpeg",
  students_group1:
    "/images/students_group1.jpeg",
  students_group2:
    "/images/students_group2.jpeg",
  ceremony:
    "/images/ceremony.jpeg",
  activity_hall:
    "/images/activity_hall.jpeg",
  teachers_historical:
    "/images/teachers_historical.jpeg",
  students_activity:
    "/images/students_activity.jpeg",
  sports:
    "/images/sports.jpeg",
  last_bell:
    "/images/WhatsApp_Image_2026-06-25_at_15.17.01.jpeg",
  last_bell_2:
    "/images/extra6.jpeg",
  last_bell_3:
    "/images/extra7.jpeg",
};

// =============================================================================
// STATIC DATA
// =============================================================================

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const newsItems: NewsItem[] = [
  {
    id: 5,
    slug: "zilja-e-fundit-2026",
    title: "Zilja e Fundit: Festimi i Maturantëve 2026",
    excerpt:
      "Gëzimi, emocionet dhe kujtimet e paharrueshme të maturantëve tanë në ceremoninë tradicionale të 'Ziljes së Fundit'.",
    content:
      "Sot u mbajt ceremonia tradicionale dhe emocionuese e 'Ziljes së Fundit' për maturantët e vitit 2026 të Shkollës së Mesme me Orientim Gjuhësor 'Asim Vokshi'.\n\nNë prani të mësuesve, prindërve dhe miqve, maturantët festuan përfundimin e këtij kapitulli të rëndësishëm të jetës së tyre me këngë, kujtime të bukura dhe premtime për të ardhmen. Shkolla u mbush me ngjyra, balona dhe përqafime të ngrohta, duke shënuar një ditë që do të mbetet gjatë në kujtesën e secilit prej nesh. Suksese të gjithë maturantëve në rrugëtimin e tyre të ri!",
    category: "Aktivitete",
    imageUrl: siteImages.last_bell,
    publishedAt: daysAgo(0),
    featured: true,
  },
  {
    id: 1,
    slug: "rikonstruksioni-eu4schools",
    title: "Rikonstruksioni i plotë i godinës me mbështetjen e EU4Schools",
    excerpt:
      "Në shkurt 2024 përfundoi rikonstruksioni i plotë i godinës sonë, financuar nga Bashkimi Europian (BE) dhe zbatuar nga UNDP.",
    content:
      "Në shkurt 2024 përfundoi rikonstruksioni i plotë i godinës së Shkollës së Mesme me Orientim Gjuhësor 'Asim Vokshi' me mbështetjen e programit EU4Schools, financuar nga BE-ja dhe zbatuar nga UNDP.\n\nSot, shkolla është e pajisur me laboratorë modernë, klasa me tabela interaktive e projektorë, bibliotekë dhe mjedise sportive, duke ofruar kushte bashkëkohore për një proces mësimor më cilësor për të gjithë nxënësit. Ky projekt transformoi plotësisht mjediset tona, duke sjellë standardet më të larta europiane direkt në klasat tona.",
    category: "Infrastrukturë",
    imageUrl: siteImages.building_front,
    publishedAt: daysAgo(2),
    featured: false,
  },
  {
    id: 2,
    slug: "misioni-i-shkolles",
    title: "Misioni i shkollës: Formimi akademik dhe kulturor i shumë brezave",
    excerpt:
      "Themeluar më 15 shtator 1965, shkolla jonë ka luajtur një rol të rëndësishëm në arsimin gjuhësor të mesëm në Shqipëri.",
    content:
      "Shkolla e Mesme me Orientim Gjuhësor 'Asim Vokshi' në Tiranë është një institucion arsimor me histori të pasur dhe reputacion të shkëlqyer. E themeluar më 15 shtator 1965 dhe emërtuar në nder të Asim Vokshit, një figurë e shquar historike dhe patriotike, shkolla jonë ka luajtur një rol të rëndësishëm në formimin akademik e kulturor të shumë brezave.\n\nGjatë këtyre viteve, shkolla është dalluar për përgatitjen cilësore të nxënësve në fusha të ndryshme dhe ka qenë një pikë referimi në metodat mësimore, si dhe në organizimin e aktiviteteve kulturore e sportive.",
    category: "Histori",
    imageUrl: siteImages.teachers_historical,
    publishedAt: daysAgo(5),
    featured: false,
  },
  {
    id: 3,
    slug: "tri-gjuhe-te-huaja",
    title: "Plani mësimor: Mësimi i tri gjuhëve të huaja",
    excerpt:
      "Plani mësimor u ndryshua për t'u dhënë nxënësve mundësinë të mësojnë tri gjuhë të huaja njëkohësisht.",
    content:
      "Në vitin 2004 u ndryshua plani mësimor në shkollën tonë, duke u dhënë nxënësve mundësinë të mësonin tri gjuhë të huaja dhe duke përfshirë lëndë të reja, si informatika dhe psikologjia.\n\nKy ndryshim e ktheu shkollën në një qendër të vërtetë shumëgjuhëshe, ku nxënësit fitojnë kompetenca të jashtëzakonshme komunikuese në gjuhë të ndryshme europiane dhe botërore, duke u hapur atyre rrugën drejt karrierave ndërkombëtare.",
    category: "Akademike",
    imageUrl: siteImages.class_interactive,
    publishedAt: daysAgo(4),
    featured: false,
  },
  {
    id: 4,
    slug: "seksionet-dygjuheshe",
    title: "Seksionet dygjuhëshe italisht-shqip dhe frëngjisht-shqip",
    excerpt:
      "Hapur në vitin 1998, seksionet tona dygjuhëshe ofrojnë integrim të plotë kulturor dhe gjuhësor me standarde europiane.",
    content:
      "Në vitin 1998 u hapën seksionet dygjuhëshe italisht-shqip dhe frëngjisht-shqip në shkollën tonë. Këto seksione përfaqësojnë një urë të rëndësishme lidhëse me kulturat përkatëse dhe ofrojnë mësimdhënie të lëndëve të ndryshme direkt në gjuhët e huaja.\n\nSeksionet tona mbështeten ngushtë nga partnerët tanë diplomatikë, duke përfshirë Ambasadën Franceze dhe Ambasadën Italiane, duke u ofruar nxënësve certifikime të njohura ndërkombëtarisht.",
    category: "Projekte",
    imageUrl: siteImages.students_group1,
    publishedAt: daysAgo(6),
    featured: false,
  },
];

export const staffItems: StaffMember[] = [
  // Drejtoria
  { id: 1, name: "Marsida Jarani", role: "Drejtore", department: "Drejtoria", bio: "Drejtore e shkollës me përvojë të gjatë në menaxhim arsimor.", email: "marsida.jarani@shavokshi.edu.al", yearsExperience: 22 },
  { id: 2, name: "Mirela Reqica", role: "Zëvendësdrejtore", department: "Drejtoria", bio: "Zëvendësdrejtore me fokus në cilësinë e mësimdhënies.", email: "mirela.reqica@shavokshi.edu.al", yearsExperience: 18 },
  { id: 3, name: "Rovena Jani", role: "Zëvendësdrejtore", department: "Drejtoria", bio: "Zëvendësdrejtore me përvojë në programe ndërkombëtare.", email: "rovena.jani@shavokshi.edu.al", yearsExperience: 16 },
  // Shërbimi Psikosocial
  { id: 4, name: "Jorida Braushi", role: "Psikologe", department: "Shërbimi Psikosocial", bio: "Psikologe shkollore.", email: "jorida.braushi@shavokshi.edu.al", yearsExperience: 12 },
  { id: 5, name: "Jonila Llabani", role: "Punonjëse sociale", department: "Shërbimi Psikosocial", bio: "Punonjëse sociale.", email: "jonila.llabani@shavokshi.edu.al", yearsExperience: 10 },
  { id: 6, name: "Ajda Leknikaj", role: "Koordinatore e sigurimit të cilësisë", department: "Koordinatore", bio: "Koordinatore e sigurimit të cilësisë.", email: "ajda.leknikaj@shavokshi.edu.al", yearsExperience: 11 },
  { id: 7, name: "Olta Barbullushi", role: "Koordinatore e këshillimit të karrierës", department: "Koordinatore", bio: "Koordinatore e këshillimit të karrierës.", email: "olta.barbullushi@shavokshi.edu.al", yearsExperience: 13 },
  { id: 8, name: "Slementina Musabelliu", role: "Oficere sigurie", department: "Oficere Sigurie", bio: "Oficere sigurie.", email: "slementina.musabelliu@shavokshi.edu.al", yearsExperience: 9 },
  // Administrata
  { id: 9, name: "Greda Stefo", role: "Sekretare", department: "Administrata", bio: "Sekretare administrate.", email: "greda.stefo@shavokshi.edu.al", yearsExperience: 15 },
  { id: 10, name: "Klea Kasa", role: "Sekretare", department: "Administrata", bio: "Sekretare administrate.", email: "klea.kasa@shavokshi.edu.al", yearsExperience: 8 },
  { id: 11, name: "Klodiana Malluta", role: "Sekretare", department: "Administrata", bio: "Sekretare administrate.", email: "klodiana.malluta@shavokshi.edu.al", yearsExperience: 12 },
  // Anglisht
  { id: 12, name: "Irena Zaimaj", role: "Shefe e departamentit", department: "Departamenti i Gjuhës Angleze", bio: "Shefe departamenti.", email: "irena.zaimaj@shavokshi.edu.al", yearsExperience: 20 },
  { id: 13, name: "Aida Zoto", role: "Mësuese", department: "Departamenti i Gjuhës Angleze", bio: "Mësuese e gjuhës angleze.", email: "aida.zoto@shavokshi.edu.al", yearsExperience: 14 },
  { id: 14, name: "Sander Kola", role: "Mësues", department: "Departamenti i Gjuhës Angleze", bio: "Mësues i gjuhës angleze.", email: "sander.kola@shavokshi.edu.al", yearsExperience: 18 },
  { id: 15, name: "Alba Gjini", role: "Mësuese", department: "Departamenti i Gjuhës Angleze", bio: "Mësuese e gjuhës angleze.", email: "alba.gjini@shavokshi.edu.al", yearsExperience: 10 },
  { id: 16, name: "Etleva Zelo", role: "Mësuese", department: "Departamenti i Gjuhës Angleze", bio: "Mësuese e gjuhës angleze.", email: "etleva.zelo@shavokshi.edu.al", yearsExperience: 16 },
  { id: 17, name: "Herald Halluli", role: "Mësues", department: "Departamenti i Gjuhës Angleze", bio: "Mësues i gjuhës angleze.", email: "herald.halluli@shavokshi.edu.al", yearsExperience: 9 },
  { id: 18, name: "Evis Kolani", role: "Mësuese", department: "Departamenti i Gjuhës Angleze", bio: "Mësuese e gjuhës angleze.", email: "evis.kolani@shavokshi.edu.al", yearsExperience: 12 },
  { id: 19, name: "Leonora Elezi", role: "Mësuese", department: "Departamenti i Gjuhës Angleze", bio: "Mësuese e gjuhës angleze.", email: "leonora.elezi@shavokshi.edu.al", yearsExperience: 15 },
  // Gjermanisht & Spanjollisht
  { id: 20, name: "Brunkela Dervishi", role: "Shefe e departamentit", department: "Departamenti i Gjuhës Gjermane & Spanjolle", bio: "Shefe departamenti.", email: "brunkela.dervishi@shavokshi.edu.al", yearsExperience: 19 },
  { id: 21, name: "Valdete Mehmeti", role: "Mësuese", department: "Departamenti i Gjuhës Gjermane & Spanjolle", bio: "Mësuese.", email: "valdete.mehmeti@shavokshi.edu.al", yearsExperience: 17 },
  { id: 22, name: "Grisilda Xhebrahimaj", role: "Mësuese", department: "Departamenti i Gjuhës Gjermane & Spanjolle", bio: "Mësuese.", email: "grisilda.xhebrahimaj@shavokshi.edu.al", yearsExperience: 8 },
  { id: 23, name: "Entela Beshaj", role: "Mësuese", department: "Departamenti i Gjuhës Gjermane & Spanjolle", bio: "Mësuese.", email: "entela.beshaj@shavokshi.edu.al", yearsExperience: 14 },
  { id: 24, name: "Nertila Buçpapaj", role: "Mësuese", department: "Departamenti i Gjuhës Gjermane & Spanjolle", bio: "Mësuese.", email: "nertila.bucpapaj@shavokshi.edu.al", yearsExperience: 11 },
  { id: 25, name: "Danjela Bogdani", role: "Mësuese", department: "Departamenti i Gjuhës Gjermane & Spanjolle", bio: "Mësuese.", email: "danjela.bogdani@shavokshi.edu.al", yearsExperience: 13 },
  // Italisht, Turqisht, Rusisht
  { id: 26, name: "Eva Pustina", role: "Shefe e departamentit", department: "Departamenti i Gjuhës Italiane, Turke dhe Ruse", bio: "Shefe departamenti.", email: "eva.pustina@shavokshi.edu.al", yearsExperience: 21 },
  { id: 27, name: "Eli Lazri", role: "Mësuese", department: "Departamenti i Gjuhës Italiane, Turke dhe Ruse", bio: "Mësuese.", email: "eli.lazri@shavokshi.edu.al", yearsExperience: 16 },
  { id: 28, name: "Anxhela Angjeli", role: "Mësuese", department: "Departamenti i Gjuhës Italiane, Turke dhe Ruse", bio: "Mësuese.", email: "anxhela.angjeli@shavokshi.edu.al", yearsExperience: 12 },
  { id: 29, name: "Enxhi Shabani", role: "Mësuese", department: "Departamenti i Gjuhës Italiane, Turke dhe Ruse", bio: "Mësuese.", email: "enxhi.shabani@shavokshi.edu.al", yearsExperience: 7 },
  { id: 30, name: "Holger Protopapa", role: "Mësues", department: "Departamenti i Gjuhës Italiane, Turke dhe Ruse", bio: "Mësues.", email: "holger.protopapa@shavokshi.edu.al", yearsExperience: 10 },
  { id: 31, name: "Argita Veizi", role: "Mësuese", department: "Departamenti i Gjuhës Italiane, Turke dhe Ruse", bio: "Mësuese.", email: "argita.veizi@shavokshi.edu.al", yearsExperience: 14 },
  // Frengjisht
  { id: 32, name: "Eva Taku", role: "Shefe e departamentit", department: "Departamenti i Gjuhës Frënge", bio: "Shefe departamenti.", email: "eva.taku@shavokshi.edu.al", yearsExperience: 22 },
  { id: 33, name: "Blerta Llakaj", role: "Mësuese", department: "Departamenti i Gjuhës Frënge", bio: "Mësuese.", email: "blerta.llakaj@shavokshi.edu.al", yearsExperience: 15 },
  { id: 34, name: "Brunilda Marku", role: "Mësuese", department: "Departamenti i Gjuhës Frënge", bio: "Mësuese.", email: "brunilda.marku@shavokshi.edu.al", yearsExperience: 18 },
  { id: 35, name: "Vjollca Shurdhi", role: "Mësuese", department: "Departamenti i Gjuhës Frënge", bio: "Mësuese.", email: "vjollca.shurdhi@shavokshi.edu.al", yearsExperience: 20 },
  { id: 36, name: "Sofilda Teta", role: "Mësuese", department: "Departamenti i Gjuhës Frënge", bio: "Mësuese.", email: "sofilda.teta@shavokshi.edu.al", yearsExperience: 12 },
  // Mësues Ndihmës
  { id: 37, name: "Alma Lulja", role: "Mësuese ndihmëse", department: "Mësuesit Ndihmës", bio: "Mësuese ndihmëse.", email: "alma.lulja@shavokshi.edu.al", yearsExperience: 8 },
  { id: 38, name: "Juxhin Bozhiqi", role: "Mësues ndihmës", department: "Mësuesit Ndihmës", bio: "Mësues ndihmës.", email: "juxhin.bozhiqi@shavokshi.edu.al", yearsExperience: 6 },
  { id: 39, name: "Kimete Hidri", role: "Mësuese ndihmëse", department: "Mësuesit Ndihmës", bio: "Mësuese ndihmëse.", email: "kimete.hidri@shavokshi.edu.al", yearsExperience: 11 },
  { id: 40, name: "Sueda Sulmina", role: "Mësuese ndihmëse", department: "Mësuesit Ndihmës", bio: "Mësuese ndihmëse.", email: "sueda.sulmina@shavokshi.edu.al", yearsExperience: 5 },
];

export const newsCategories = Array.from(new Set(newsItems.map((n) => n.category)));
export const staffDepartments = Array.from(new Set(staffItems.map((s) => s.department)));

// =============================================================================
// SELECTORS
// =============================================================================

export function getNewsList(params: GetNewsParams = {}): NewsListResponse {
  const { search, category, page = 1, limit = 9 } = params;

  let items = [...newsItems];

  if (category) {
    items = items.filter(
      (n) => n.category.toLowerCase() === category.toLowerCase(),
    );
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q),
    );
  }
  items.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const total = items.length;
  const paginated = items.slice((page - 1) * limit, page * limit);

  return {
    items: paginated,
    total,
    page,
    limit,
    categories: newsCategories,
  };
}

export function getStaffList(params: GetStaffParams = {}): StaffListResponse {
  const { search, department } = params;
  let items = [...staffItems];

  if (department) {
    items = items.filter(
      (s) => s.department.toLowerCase() === department.toLowerCase(),
    );
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q),
    );
  }
  items.sort((a, b) => a.name.localeCompare(b.name));

  return { items, departments: staffDepartments };
}



export function getNewsById(id: number): NewsItem | undefined {
  return newsItems.find((n) => n.id === id);
}
