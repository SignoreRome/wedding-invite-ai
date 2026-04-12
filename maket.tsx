export default function WeddingInviteWindows() {
    const surveyOptions = [
        "Обязательно буду",
        "Скорее всего буду",
        "Пока не уверен(а)",
        "К сожалению, не смогу"
    ];

    const menuItems = ["Файл", "Правка", "Вид", "Справка"];

    return (
        <div
            className="min-h-screen bg-[#3a6ea5] text-black p-4 md:p-8"
    style={{ fontFamily: "Tahoma, Verdana, sans-serif" }}
>
    <div className="max-w-6xl mx-auto">
    <div className="border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] shadow-[10px_10px_0_rgba(0,0,0,0.22)] overflow-hidden rounded-[6px]">
    <div className="bg-gradient-to-r from-[#0054e3] via-[#2b7cff] to-[#67a7ff] text-white px-3 py-2 flex items-center justify-between text-sm font-bold">
        <span>Wedding Invitation Wizard</span>
    <div className="flex gap-1">
    <button className="w-5 h-5 bg-[#d4d0c8] text-black border border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-xs leading-none">_</button>
        <button className="w-5 h-5 bg-[#d4d0c8] text-black border border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-xs leading-none">□</button>
    <button className="w-5 h-5 bg-[#d4d0c8] text-black border border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-xs leading-none">×</button>
    </div>
    </div>

    <div className="px-3 py-1 text-sm border-b border-[#808080] bg-[#ece9d8] flex gap-4">
        {menuItems.map((item) => (
                <span key={item} className="hover:underline cursor-default">{item}</span>
))}
    </div>

    <div className="grid lg:grid-cols-[250px_1fr] min-h-[820px]">
    <aside className="bg-gradient-to-b from-[#0b5bd3] to-[#7fb2ff] text-white p-5 border-r border-[#7a7a7a]">
    <div className="border border-white/40 bg-white/10 p-4 rounded-[4px]">
    <div className="w-20 h-20 mx-auto mb-4 border-2 border-white/70 bg-white text-[#d40000] flex items-center justify-center text-5xl font-bold shadow-[inset_1px_1px_0_rgba(255,255,255,0.6)]">
                  ♥
                </div>
                <div className="text-center">
    <div className="text-xl font-black uppercase tracking-wide leading-tight">
        Wedding<br />Setup
        </div>
        <div className="text-xs mt-2 text-white/90">
        Версия 07.08.2026
    </div>
    </div>
    </div>

    <div className="mt-6 space-y-3 text-sm">
    <SidebarItem number="01" title="Событие" active />
    <SidebarItem number="02" title="Дата и место" />
    <SidebarItem number="03" title="Дресс-код" />
    <SidebarItem number="04" title="Опрос гостей" />
        </div>

        <div className="mt-8 border border-white/40 bg-[#ffffff22] p-3 text-xs leading-relaxed">
        Installation note:\nПожалуйста, приходите с хорошим настроением и готовностью праздновать вместе с нами.
    </div>
    </aside>

    <main className="bg-[#ece9d8] p-4 md:p-6 space-y-5">
    <section className="border border-[#7f9db9] bg-white shadow-[inset_1px_1px_0_white]">
    <div className="px-4 py-3 border-b border-[#c7c7c7] bg-gradient-to-r from-white to-[#f3f7ff]">
    <div className="text-xs uppercase tracking-wide text-[#4b4b4b] mb-1">Мастер приглашения</div>
    <h1 className="text-3xl md:text-4xl font-black text-[#003399] leading-none">Мы женимся!</h1>
    <div className="text-sm md:text-base font-bold text-[#5a5a5a] mt-2">[ Save the date ] 07.08.2026</div>
    </div>

    <div className="p-5 grid lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
    <div>
        <div className="inline-block px-2 py-1 bg-[#ffffcc] border border-[#808080] text-xs mb-3">
        Новое событие обнаружено
    </div>
    <p className="text-base md:text-lg leading-relaxed max-w-2xl">
        Приглашаем вас разделить с нами самый важный и радостный день. Сохраните дату,
        зарядите хорошее настроение и приходите праздновать вместе с нами.
    </p>
    </div>

    <div className="border border-[#7f9db9] bg-[#f7f7f7] p-4 shadow-[inset_1px_1px_0_white]">
    <div className="text-xs uppercase mb-2 text-[#555]">Системная информация</div>
    <div className="space-y-2 text-sm">
    <div className="flex justify-between gap-3 border-b border-dotted border-[#808080] pb-1">
        <span>Файл события</span>
    <span className="font-bold">Wedding Day</span>
    </div>
    <div className="flex justify-between gap-3 border-b border-dotted border-[#808080] pb-1">
        <span>Версия</span>
        <span className="font-bold">07.08.2026</span>
    </div>
    <div className="flex justify-between gap-3 border-b border-dotted border-[#808080] pb-1">
        <span>Возрастные ограничения</span>
    <span className="font-bold text-[#8b0000]">18+</span>
        </div>
        </div>
        </div>
        </div>
        </section>

        <section className="grid md:grid-cols-2 gap-5">
    <ContentPanel title="Дата и место" dotColor="#2b63d9">
    <div className="grid gap-4">
    <div className="border border-[#7f9db9] bg-[#fdfdfd] p-4 shadow-[inset_1px_1px_0_white]">
    <div className="text-xs uppercase text-[#555] mb-1">Дата</div>
        <div className="text-3xl font-black tracking-wide">07 / 08 / 2026</div>
    </div>

    <div className="border border-[#7f9db9] bg-[#fdfdfd] p-4 shadow-[inset_1px_1px_0_white]">
    <div className="text-xs uppercase text-[#555] mb-1">Начало</div>
        <div className="text-2xl font-bold">15:00</div>
    <p className="text-sm mt-1">Сбор гостей и welcome-drink</p>
    </div>

    <div className="border border-[#7f9db9] bg-[#fdfdfd] p-4 shadow-[inset_1px_1px_0_white]">
    <div className="text-xs uppercase text-[#555] mb-1">Место</div>
        <div className="text-xl font-bold">Банкетный зал «Название площадки»</div>
    <p className="text-sm mt-2">г. Москва, ул. Примерная, 15</p>
    <div className="bg-[#ffffcc] border border-[#808080] p-3 text-sm mt-3">
        Здесь можно добавить карту, тайминг дня или ссылку на маршрут.
    </div>
    <div className="text-xs text-[#555] font-mono mt-2">C:\wedding\location\venue_info.txt</div>
    </div>
    </div>
    </ContentPanel>

    <ContentPanel title="Дресс-код" dotColor="#7a3db8">
    <div className="space-y-4">
    <div className="border border-[#7f9db9] bg-[#fdfdfd] p-4 shadow-[inset_1px_1px_0_white]">
    <p className="text-sm leading-relaxed">
        Нам будет приятно видеть вас в образах, которые поддержат атмосферу праздника.
        Выбирайте наряды в спокойной, элегантной палитре.
    </p>
    </div>

    <div className="grid grid-cols-3 gap-3">
        {[
                "bg-[#d8cfc4]",
            "bg-[#b8c4d6]",
            "bg-[#c9b8c8]",
            "bg-[#6d7b8d]",
            "bg-[#e8dfd1]",
            "bg-[#8b6f7d]"
].map((color, index) => (
        <div
            key={index}
    className={`h-16 border border-[#7f9db9] shadow-[inset_1px_1px_0_rgba(255,255,255,0.7)] ${color}`}
    />
))}
    </div>

    <div className="border border-[#7f9db9] bg-white p-3 text-sm">
        Избегайте полностью белых образов, чтобы этот цвет остался за невестой.
    </div>
    </div>
    </ContentPanel>
    </section>

    <section>
    <ContentPanel title="Опрос гостей" dotColor="#1d8b3b">
    <form className="border border-[#7f9db9] bg-white p-4 md:p-5 space-y-4 shadow-[inset_1px_1px_0_white]">
    <div>
        <label className="block text-sm font-bold mb-1">Ваше имя</label>
    <input
    className="w-full bg-white px-3 py-2 text-sm border border-[#7f9db9] outline-none"
    placeholder="Введите имя"
    />
    </div>

    <div>
    <label className="block text-sm font-bold mb-2">Сможете ли вы присутствовать?</label>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {surveyOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer border border-[#d0d0d0] bg-[#fafafa] px-3 py-2">
            <input type="radio" name="attendance" className="accent-black" />
                <span>{option}</span>
                </label>
))}
    </div>
    </div>

    <div>
    <label className="block text-sm font-bold mb-1">Предпочтения по еде / комментарий</label>
    <textarea
    rows={4}
    className="w-full bg-white px-3 py-2 text-sm border border-[#7f9db9] outline-none resize-none"
    placeholder="Например: вегетарианское меню, аллергия, плюс один и т.д."
        />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
    <span className="text-xs font-mono text-[#555]">form_status: ready</span>
    <div className="flex flex-wrap gap-3">
        <XpButton>Отправить</XpButton>
        <XpButton secondary>Очистить</XpButton>
    </div>
    </div>
    </form>
    </ContentPanel>
    </section>

    <div className="border border-[#7f9db9] bg-[#ece9d8] px-4 py-3 flex items-center justify-between gap-4 text-sm">
    <div className="flex items-center gap-2 min-w-0">
    <button className="px-4 py-1 font-bold border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#d4d0c8] rounded-[3px]">
        Start
        </button>
        <div className="truncate">Wedding Invitation OS</div>
    </div>
    <div className="border border-[#7f9db9] bg-white px-3 py-1 whitespace-nowrap shadow-[inset_1px_1px_0_white]">
        07.08.2026 · Love Mode
    </div>
    </div>
    </main>
    </div>
    </div>
    </div>
    </div>
);
}

function SidebarItem({ number, title, active = false }) {
    return (
        <div
            className={`flex items-center gap-3 px-3 py-2 border ${
            active
                ? "bg-white text-[#003399] border-white"
                : "bg-[#ffffff1f] text-white border-white/40"
        }`}
>
    <div
        className={`w-8 h-8 flex items-center justify-center text-xs font-black border ${
        active ? "bg-[#eaf2ff] border-[#7f9db9]" : "bg-white/15 border-white/40"
    }`}
>
    {number}
    </div>
    <div className="font-bold">{title}</div>
        </div>
);
}

function ContentPanel({ title, dotColor, children }) {
    return (
        <section className="border border-[#7f9db9] bg-[#f8f8f8]">
        <div className="px-4 py-3 border-b border-[#c7c7c7] bg-gradient-to-r from-white to-[#eef3ff] flex items-center gap-2">
        <div className="w-3 h-3 border border-[#404040]" style={{ backgroundColor: dotColor }} />
    <h2 className="text-lg md:text-xl font-black tracking-wide">{title}</h2>
        </div>
        <div className="p-4">{children}</div>
        </section>
);
}

function XpButton({ children, secondary = false }) {
    return (
        <button
            type="button"
    className={`px-5 py-2 text-sm font-bold rounded-[3px] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] ${
        secondary ? "bg-[#e7e7e7]" : "bg-[#d4e7ff]"
    }`}
>
    {children}
    </button>
);
}
