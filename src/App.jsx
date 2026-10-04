import React, { useEffect, useMemo, useState } from 'react'
import {
  Bell, Search, Plus, Home, Compass, UserRound, Activity, ShoppingCart, Wrench,
  KeyRound, ClipboardCheck, MapPin, ArrowLeft, Star, MessageCircle, Phone, Clock3,
  ChevronLeft, LogOut, Settings, ShieldCheck, BadgeCheck, Heart, SlidersHorizontal,
  ImagePlus, Send, X, Eye, EyeOff, Check, BriefcaseBusiness, RefreshCw,
  UserCheck, ListChecks, BellRing, Moon, Globe2, Flag, Ban, Save, ExternalLink,
  CheckCircle2, XCircle, PhoneCall
} from 'lucide-react'
import { supabase } from './lib/supabase'
import { APP_CONFIG } from './lib/config'
import { initNotifications, requestNotificationPermission, logoutNotifications } from './lib/notifications'

const REQUEST_TYPES = [
  { key: 'purchase', label: 'شراء', Icon: ShoppingCart, tone: 'green' },
  { key: 'service', label: 'خدمة', Icon: Wrench, tone: 'blue' },
  { key: 'rent', label: 'إيجار', Icon: KeyRound, tone: 'orange' },
  { key: 'task', label: 'مهمة', Icon: ClipboardCheck, tone: 'purple' }
]

const PROVINCES = ['بغداد', 'صلاح الدين', 'أربيل', 'البصرة', 'النجف', 'كربلاء', 'نينوى', 'كركوك', 'ديالى', 'الأنبار', 'واسط', 'ذي قار']

function cx(...v) { return v.filter(Boolean).join(' ') }
function money(value) {
  if (value == null || value === '') return 'حسب الاتفاق'
  return `${Number(value).toLocaleString('ar-IQ')} د.ع`
}
function ago(date) {
  if (!date) return ''
  const d = Math.max(0, Date.now() - new Date(date).getTime())
  const min = Math.floor(d / 60000)
  if (min < 1) return 'الآن'
  if (min < 60) return `منذ ${min} دقيقة`
  const h = Math.floor(min / 60)
  if (h < 24) return `منذ ${h} ساعة`
  return `منذ ${Math.floor(h / 24)} يوم`
}
function typeInfo(key) { return REQUEST_TYPES.find(x => x.key === key) || REQUEST_TYPES[1] }

function AppLogo({ compact = false }) {
  return <div className={cx('brand', compact && 'brand--compact')}>
    <img src={`${import.meta.env.BASE_URL}icon-192.webp`} alt="مطلوب" />
    <div><strong>مطلوب</strong>{!compact && <span>{APP_CONFIG.tagline}</span>}</div>
  </div>
}

function Loader({ label = 'جاري التحميل' }) {
  return <div className="center-state"><div className="spinner"/><p>{label}</p></div>
}

function Toast({ message, onClose }) {
  useEffect(() => { if (!message) return; const t=setTimeout(onClose, 3200); return()=>clearTimeout(t) }, [message, onClose])
  if (!message) return null
  return <div className="toast">{message}</div>
}

function Splash() {
  return <div className="splash"><div className="splash-glow"/><img src={`${import.meta.env.BASE_URL}icon-512.webp`} /><h1>مطلوب</h1><p>{APP_CONFIG.tagline}</p></div>
}

function Onboarding({ onDone }) {
  return <div className="auth-page onboarding">
    <div className="auth-backdrop"/>
    <div className="onboarding-card glass">
      <AppLogo />
      <div className="hero-copy">
        <span className="eyebrow">كل احتياجاتك في مكان واحد</span>
        <h1>لا تدور كثير.<br/><em>اطلب وخلي العروض تجيك.</em></h1>
        <p>شراء، خدمات، إيجار ومهام من أشخاص ومقدمي خدمات قريبين منك، مع محادثة داخل التطبيق ونظام تقييم واضح.</p>
      </div>
      <div className="feature-grid">
        <div><RefreshCw/><b>عروض متعددة</b><small>قارن واختار الأنسب</small></div>
        <div><ShieldCheck/><b>خصوصية أفضل</b><small>رقم الهاتف حسب اختيار المزود</small></div>
        <div><MessageCircle/><b>تواصل داخلي</b><small>كل تفاصيل الطلب في محادثة واحدة</small></div>
      </div>
      <button className="primary-btn" onClick={onDone}>ابدأ الآن <ArrowLeft size={18}/></button>
    </div>
  </div>
}

function AuthScreen({ onToast }) {
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'' })

  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
        if (error) throw error
      } else {
        if (form.name.trim().length < 2) throw new Error('اكتب اسمك بشكل صحيح')
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(), password: form.password,
          options: { data: { display_name: form.name.trim() } }
        })
        if (error) throw error
        if (!data.session) onToast('تم إنشاء الحساب. تحقق من البريد إذا كان التأكيد مفعلاً.')
      }
    } catch (err) { onToast(err.message || 'تعذر إكمال العملية') }
    finally { setBusy(false) }
  }

  return <div className="auth-page"><div className="auth-backdrop"/>
    <div className="auth-card glass">
      <AppLogo />
      <div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>تسجيل الدخول</button><button className={mode==='signup'?'active':''} onClick={()=>setMode('signup')}>إنشاء حساب</button></div>
      <form onSubmit={submit}>
        {mode==='signup' && <label>الاسم الكامل<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="مثال: أحمد محمد" required/></label>}
        <label>البريد الإلكتروني<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="name@example.com" required/></label>
        <label>كلمة المرور<div className="password-field"><input type={showPass?'text':'password'} minLength={8} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="8 أحرف أو أكثر" required/><button type="button" onClick={()=>setShowPass(v=>!v)}>{showPass?<EyeOff/>:<Eye/>}</button></div></label>
        <button className="primary-btn" disabled={busy}>{busy?'جاري المعالجة...':(mode==='login'?'تسجيل الدخول':'إنشاء الحساب')}</button>
      </form>
      <p className="microcopy">بالاستمرار أنت توافق على شروط الاستخدام وسياسة الخصوصية.</p>
    </div>
  </div>
}

function LocationSetup({ profile, onDone, onToast }) {
  const [province, setProvince] = useState(profile?.province || 'بغداد')
  const [city, setCity] = useState(profile?.city || '')
  const [busy,setBusy]=useState(false)
  async function save(){setBusy(true); const {error}=await supabase.from('profiles').update({province,city:city.trim()||province}).eq('id',profile.id); setBusy(false); if(error)onToast(error.message); else onDone({...profile,province,city:city.trim()||province})}
  return <div className="auth-page"><div className="auth-backdrop"/><div className="auth-card glass"><AppLogo/><div className="section-heading"><MapPin/><div><h2>حدد منطقتك</h2><p>حتى نعرض لك الطلبات والخدمات الأقرب.</p></div></div><div className="province-grid">{PROVINCES.map(p=><button key={p} className={province===p?'active':''} onClick={()=>setProvince(p)}>{province===p&&<Check size={15}/>} {p}</button>)}</div><label>المدينة أو المنطقة<input value={city} onChange={e=>setCity(e.target.value)} placeholder="مثال: الكرادة، تكريت، المنصور"/></label><button className="primary-btn" disabled={busy} onClick={save}>{busy?'جاري الحفظ...':'متابعة'}</button></div></div>
}

function Topbar({ profile, title, onBack, onNotifications }) {
  return <header className="topbar">
    <div className="topbar-side">{onBack?<button className="icon-btn" onClick={onBack}><ChevronLeft/></button>:<button className="icon-btn" onClick={onNotifications}><Bell/></button>}</div>
    <div className="topbar-title">{title || <AppLogo compact/>}</div>
    <div className="location-pill"><MapPin size={15}/><span>{profile?.city || profile?.province || 'العراق'}</span></div>
  </header>
}

function BottomNav({ tab, setTab, onCreate }) {
  const items=[['home','الرئيسية',Home],['explore','استكشف',Search],['create','',Plus],['activity','النشاط',Activity],['profile','حسابي',UserRound]]
  return <nav className="bottom-nav">{items.map(([k,l,Icon])=> k==='create' ? <button key={k} className="create-fab" onClick={onCreate}><Icon/></button> : <button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}><Icon/><span>{l}</span></button>)}</nav>
}

function TypeTiles({ onPick }) {
  return <div className="type-tiles">{REQUEST_TYPES.map(({key,label,Icon,tone})=><button key={key} className={`type-tile ${tone}`} onClick={()=>onPick?.(key)}><Icon/><span>{label}</span></button>)}</div>
}

function RequestCard({ item, onOpen }) {
  const info=typeInfo(item.request_type); const Icon=info.Icon
  const media=item.request_media?.[0]?.public_url
  return <button className="request-card" onClick={()=>onOpen(item)}>
    <div className="request-thumb">{media?<img src={media} alt=""/>:<Icon/>}</div>
    <div className="request-main"><div className="request-line"><span className={`tag ${info.tone}`}>{info.label}</span><small>{ago(item.created_at)}</small></div><h3>{item.title}</h3><p><MapPin size={14}/>{item.city||item.province||'العراق'} <span>·</span> {item.offers_count||0} عروض</p></div>
    <ChevronLeft className="chevron" size={19}/>
  </button>
}

function HomeScreen({ profile, onOpen, onCreateType }) {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [query,setQuery]=useState('')
  async function load(){setLoading(true); const {data}=await supabase.from('requests').select('*, request_media(public_url)').eq('status','open').order('created_at',{ascending:false}).limit(30); setItems(data||[]); setLoading(false)}
  useEffect(()=>{load()},[])
  const filtered=useMemo(()=>items.filter(x=>!query||`${x.title} ${x.description}`.includes(query)),[items,query])
  return <><Topbar profile={profile}/><main className="screen page-with-nav">
    <section className="home-hero"><div className="hero-glow"/><span>مطلوبك اليوم أقرب مما تتصور</span><h1>شنو مطلوبك اليوم؟</h1><div className="searchbox"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="مثال: كهربائي، iPhone مستعمل، كاميرا للإيجار..."/></div></section>
    <TypeTiles onPick={onCreateType}/>
    <div className="section-title"><div><h2>أحدث الطلبات</h2><p>طلبات جديدة من مجتمع مطلوب</p></div><button onClick={load}><RefreshCw size={18}/></button></div>
    {loading?<Loader/>:<div className="request-list">{filtered.length?filtered.map(x=><RequestCard key={x.id} item={x} onOpen={onOpen}/>):<div className="empty-card">لا توجد طلبات مطابقة حالياً.</div>}</div>}
  </main></>
}

function ExploreScreen({ profile, onOpen }) {
  const [type,setType]=useState('all'); const [q,setQ]=useState(''); const [items,setItems]=useState([]); const [loading,setLoading]=useState(true)
  useEffect(()=>{(async()=>{setLoading(true);let req=supabase.from('requests').select('*, request_media(public_url)').eq('status','open').order('created_at',{ascending:false}).limit(60); if(type!=='all')req=req.eq('request_type',type); const {data}=await req;setItems(data||[]);setLoading(false)})()},[type])
  const filtered=items.filter(x=>!q||(`${x.title} ${x.description} ${x.city||''}`).includes(q))
  return <><Topbar profile={profile} title="استكشف"/><main className="screen page-with-nav"><div className="searchbox explore-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث عن طلب أو خدمة..."/><SlidersHorizontal/></div><div className="chips"><button className={type==='all'?'active':''} onClick={()=>setType('all')}>الكل</button>{REQUEST_TYPES.map(x=><button key={x.key} className={type===x.key?'active':''} onClick={()=>setType(x.key)}>{x.label}</button>)}</div>{loading?<Loader/>:<div className="request-list">{filtered.map(x=><RequestCard key={x.id} item={x} onOpen={onOpen}/>)}</div>}</main></>
}

function CreateRequest({ profile, initialType='service', onClose, onCreated, onToast }) {
  const [type,setType]=useState(initialType); const [cats,setCats]=useState([]); const [busy,setBusy]=useState(false)
  const [form,setForm]=useState({title:'',description:'',category_id:'',budget_min:'',budget_max:'',city:profile.city||'',province:profile.province||''}); const [files,setFiles]=useState([])
  useEffect(()=>{supabase.from('categories').select('*').eq('request_type',type).order('sort_order').then(({data})=>setCats(data||[]))},[type])
  async function uploadMedia(req, file, order){
    if(file.size <= APP_CONFIG.maxDirectUploadBytes){
      const path=`${profile.id}/${req.id}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`
      const up=await supabase.storage.from('request-media').upload(path,file,{upsert:false,contentType:file.type||undefined})
      if(up.error) throw up.error
      const {data:url}=supabase.storage.from('request-media').getPublicUrl(path)
      const {error}=await supabase.from('request_media').insert({request_id:req.id,owner_id:profile.id,backend:'supabase',public_url:url.publicUrl,mime_type:file.type,size_bytes:file.size,sort_order:order})
      if(error) throw error
      return
    }
    const {data:{session}}=await supabase.auth.getSession()
    if(!session?.access_token) throw new Error('انتهت الجلسة. سجل دخولك من جديد.')
    const body=new FormData();body.append('file',file);body.append('request_id',req.id)
    const res=await fetch(`${APP_CONFIG.gatewayUrl}/upload`,{method:'POST',headers:{authorization:`Bearer ${session.access_token}`},body})
    const data=await res.json().catch(()=>({}))
    if(!res.ok) throw new Error(data.error==='STORAGE_NOT_CONFIGURED'?'التخزين الكبير غير مفعّل بعد. أضف إعدادات Telegram في Railway.':data.error||'تعذر رفع الملف الكبير')
    const {error}=await supabase.from('request_media').insert({request_id:req.id,owner_id:profile.id,backend:'telegram',telegram_file_id:data.fileId,telegram_message_id:data.messageId,mime_type:data.mimeType||file.type,size_bytes:data.sizeBytes||file.size,sort_order:order})
    if(error) throw error
  }
  async function submit(e){e.preventDefault();setBusy(true);try{
    if(form.budget_min&&form.budget_max&&Number(form.budget_max)<Number(form.budget_min))throw new Error('الحد الأعلى للميزانية لازم يكون أكبر من الحد الأدنى.')
    const {data:req,error}=await supabase.from('requests').insert({owner_id:profile.id,request_type:type,category_id:form.category_id?Number(form.category_id):null,title:form.title.trim(),description:form.description.trim(),budget_min:form.budget_min?Number(form.budget_min):null,budget_max:form.budget_max?Number(form.budget_max):null,province:form.province,city:form.city}).select().single(); if(error)throw error
    for(let i=0;i<files.length;i++){await uploadMedia(req,files[i],i)}
    onCreated(req)
  }catch(err){onToast(err.message||'تعذر نشر الطلب')}finally{setBusy(false)}}
  return <div className="overlay-page"><Topbar profile={profile} title="إنشاء طلب" onBack={onClose}/><main className="screen form-screen"><TypeTiles onPick={k=>{setType(k);setForm({...form,category_id:''})}}/><form onSubmit={submit} className="stack-form"><label>القسم<select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">اختر القسم</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name_ar}</option>)}</select></label><label>عنوان الطلب<input maxLength={120} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="مثال: أحتاج كهربائي اليوم" required/></label><label>تفاصيل الطلب<textarea maxLength={5000} rows={5} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="اكتب التفاصيل المهمة بوضوح..."/></label><div className="two-cols"><label>الميزانية من<input type="number" inputMode="numeric" value={form.budget_min} onChange={e=>setForm({...form,budget_min:e.target.value})} placeholder="0"/></label><label>إلى<input type="number" inputMode="numeric" value={form.budget_max} onChange={e=>setForm({...form,budget_max:e.target.value})} placeholder="0"/></label></div><label>المدينة<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label><label className="upload-box"><ImagePlus/><span>إضافة صور أو فيديو</span><small>حتى 20MB مباشر، والأكبر يمر من بوابة التخزين الكبير</small><input type="file" accept="image/*,video/mp4" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/></label>{files.length>0&&<div className="file-list">{files.map(f=><span key={f.name}>{f.name}</span>)}</div>}<button className="primary-btn" disabled={busy}>{busy?'جاري النشر...':'نشر الطلب'}</button></form></main></div>
}

function OfferForm({ request, profile, onDone, onToast }) {
  const [amount,setAmount]=useState('');const[msg,setMsg]=useState('');const[eta,setEta]=useState('');const[busy,setBusy]=useState(false)
  async function send(){setBusy(true);const {error}=await supabase.from('offers').insert({request_id:request.id,provider_id:profile.id,amount:amount?Number(amount):null,message:msg,eta_text:eta});setBusy(false);if(error)onToast(error.message);else onDone()}
  return <div className="offer-compose"><h3>قدّم عرضك</h3><div className="two-cols"><label>السعر<input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="مثال: 70000"/></label><label>وقت الوصول<input value={eta} onChange={e=>setEta(e.target.value)} placeholder="مثال: خلال ساعة"/></label></div><label>ملاحظتك<textarea rows={3} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="وضح ماذا يشمل العرض"/></label><button className="primary-btn" disabled={busy} onClick={send}>{busy?'جاري الإرسال...':'إرسال العرض'}</button></div>
}

function RequestDetail({ request, profile, onBack, onChat, onToast }) {
  const [offers,setOffers]=useState([]);const[loading,setLoading]=useState(true);const[conversation,setConversation]=useState(null)
  const [favorite,setFavorite]=useState(false);const[status,setStatus]=useState(request.status);const[busy,setBusy]=useState(false)
  const isOwner=request.owner_id===profile.id
  async function load(){
    setLoading(true)
    const tasks=[
      supabase.from('offers').select('*, profiles:provider_id(display_name,avatar_url,provider_title,provider_stats(verified,rating_sum,rating_count))').eq('request_id',request.id).order('created_at'),
      supabase.from('conversations').select('*').eq('request_id',request.id).maybeSingle(),
      supabase.from('favorites').select('request_id').eq('user_id',profile.id).eq('request_id',request.id).maybeSingle()
    ]
    const [o,c,f]=await Promise.all(tasks)
    setOffers(o.data||[]);setConversation(c.data||null);setFavorite(Boolean(f.data));setLoading(false)
  }
  useEffect(()=>{load()},[request.id])
  async function accept(id){setBusy(true);const {data,error}=await supabase.rpc('accept_offer',{p_offer_id:id});setBusy(false);if(error)return onToast(error.message);setStatus('accepted');await load();onToast('تم قبول العرض وفتح المحادثة.'); if(data) onChat({id:data,request_id:request.id,client_id:profile.id})}
  async function toggleFavorite(){
    if(favorite){const {error}=await supabase.from('favorites').delete().eq('user_id',profile.id).eq('request_id',request.id);if(error)return onToast(error.message);setFavorite(false);onToast('تمت الإزالة من المفضلة')}
    else{const {error}=await supabase.from('favorites').insert({user_id:profile.id,request_id:request.id});if(error)return onToast(error.message);setFavorite(true);onToast('تم الحفظ في المفضلة')}
  }
  async function updateStatus(next){setBusy(true);const {error}=await supabase.from('requests').update({status:next}).eq('id',request.id);setBusy(false);if(error)return onToast(error.message);setStatus(next);onToast(next==='completed'?'تم إكمال الطلب':'تم تحديث حالة الطلب')}
  async function callProvider(providerId){
    const {data,error}=await supabase.rpc('get_provider_contact',{p_provider_id:providerId,p_request_id:request.id})
    if(error)return onToast(error.message)
    const row=Array.isArray(data)?data[0]:data
    if(!row?.phone)return onToast('مقدم الخدمة اختار التواصل داخل التطبيق أو لم يسمح بإظهار الرقم بعد.')
    window.location.href=`tel:${row.phone}`
  }
  const info=typeInfo(request.request_type)
  const statusLabel={open:'مفتوح',accepted:'تم قبول عرض',in_progress:'قيد التنفيذ',completed:'مكتمل',cancelled:'ملغي'}[status]||status
  return <div className="overlay-page"><Topbar profile={profile} title="تفاصيل الطلب" onBack={onBack}/><main className="screen detail-screen"><div className="detail-card"><div className="request-line"><span className={`tag ${info.tone}`}>{info.label}</span><span className="status-pill">{statusLabel}</span></div><h1>{request.title}</h1><p className="detail-desc">{request.description||'لم تتم إضافة تفاصيل أخرى.'}</p><div className="detail-meta"><span><MapPin/>{request.city||request.province}</span><span><Clock3/>{ago(request.created_at)}</span><span><MessageCircle/>{request.offers_count||0} عروض</span></div><div className="budget-box"><small>الميزانية المتوقعة</small><strong>{request.budget_min||request.budget_max?`${money(request.budget_min)} — ${money(request.budget_max)}`:'حسب الاتفاق'}</strong></div></div>
    <div className="detail-actions"><button className="secondary-btn" onClick={toggleFavorite}><Heart fill={favorite?'currentColor':'none'}/>{favorite?'محفوظ':'حفظ'}</button>{conversation&&<button className="secondary-btn" onClick={()=>onChat(conversation)}><MessageCircle/> فتح المحادثة</button>}</div>
    {isOwner&&status==='accepted'&&<button className="primary-btn full" disabled={busy} onClick={()=>updateStatus('in_progress')}><CheckCircle2/> بدء التنفيذ</button>}
    {isOwner&&status==='in_progress'&&<button className="primary-btn full" disabled={busy} onClick={()=>updateStatus('completed')}><CheckCircle2/> تأكيد اكتمال الطلب</button>}
    {isOwner&&['open','accepted','in_progress'].includes(status)&&<button className="secondary-btn full danger-soft" disabled={busy} onClick={()=>updateStatus('cancelled')}><XCircle/> إلغاء الطلب</button>}
    {!isOwner && profile.provider_enabled && status==='open' && !offers.some(o=>o.provider_id===profile.id) && <OfferForm request={{...request,status}} profile={profile} onDone={()=>{load();onToast('تم إرسال عرضك')}} onToast={onToast}/>} 
    <div className="section-title"><div><h2>العروض المقدمة</h2><p>{isOwner?'قارن بين السعر والتقييم ووقت التنفيذ':'عرضك وحالة الطلب'}</p></div></div>
    {loading?<Loader/>:<div className="offers-list">{offers.length?offers.map(o=>{const stat=Array.isArray(o.profiles?.provider_stats)?o.profiles.provider_stats[0]:o.profiles?.provider_stats; const count=stat?.rating_count||0; const avg=count?((stat.rating_sum||0)/count).toFixed(1):'جديد'; return <div className="offer-card" key={o.id}><div className="offer-avatar">{o.profiles?.avatar_url?<img src={o.profiles.avatar_url}/>:<UserRound/>}</div><div className="offer-body"><div className="offer-head"><h3>{o.profiles?.display_name||'مقدم خدمة'} {stat?.verified&&<BadgeCheck/>}</h3><span>{money(o.amount)}</span></div>{o.profiles?.provider_title&&<small className="provider-title">{o.profiles.provider_title}</small>}<p>{o.message||'بدون ملاحظات إضافية'}</p><div className="offer-stats"><span><Star/> {avg}</span>{o.eta_text&&<span><Clock3/> {o.eta_text}</span>}<span className={`offer-status ${o.status}`}>{o.status==='pending'?'قيد الانتظار':o.status==='accepted'?'مقبول':o.status==='rejected'?'غير مختار':'مسحوب'}</span></div><div className="offer-buttons">{isOwner&&o.status==='pending'&&status==='open'&&<button className="primary-btn mini" disabled={busy} onClick={()=>accept(o.id)}>قبول العرض</button>}{o.status==='accepted'&&<><button className="secondary-btn mini" onClick={()=>conversation&&onChat(conversation)}><MessageCircle/> مراسلة</button><button className="secondary-btn mini" onClick={()=>callProvider(o.provider_id)}><PhoneCall/> اتصال</button></>}</div></div></div>}) : <div className="empty-card">ماكو عروض لحد الآن.</div>}</div>}
  </main></div>
}

function ChatScreen({ conversation, profile, onBack, onToast }) {
  const [messages,setMessages]=useState([]); const [text,setText]=useState('');const[busy,setBusy]=useState(false)
  async function load(){const {data}=await supabase.from('messages').select('*').eq('conversation_id',conversation.id).order('created_at');setMessages(data||[]);await supabase.rpc('mark_conversation_read',{p_conversation_id:conversation.id})}
  useEffect(()=>{load();const ch=supabase.channel(`conversation:${conversation.id}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${conversation.id}`},p=>setMessages(m=>m.some(x=>x.id===p.new.id)?m:[...m,p.new])).subscribe();return()=>supabase.removeChannel(ch)},[conversation.id])
  async function send(){const body=text.trim();if(!body)return;setBusy(true);setText('');const {error}=await supabase.from('messages').insert({conversation_id:conversation.id,sender_id:profile.id,body});setBusy(false);if(error){setText(body);onToast(error.message)}}
  return <div className="overlay-page chat-page"><Topbar profile={profile} title="المحادثة" onBack={onBack}/><main className="chat-messages">{messages.map(m=><div key={m.id} className={cx('bubble',m.sender_id===profile.id?'mine':'theirs')}><p>{m.body}</p><small>{new Date(m.created_at).toLocaleTimeString('ar-IQ',{hour:'2-digit',minute:'2-digit'})}</small></div>)}</main><div className="chat-compose"><button className="icon-btn"><Plus/></button><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="اكتب رسالتك هنا..."/><button className="send-btn" onClick={send} disabled={busy}><Send/></button></div></div>
}

function ActivityScreen({ profile }) {
  const [items,setItems]=useState([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{let mounted=true;(async()=>{const {data}=await supabase.from('notifications').select('*').order('created_at',{ascending:false}).limit(50);if(mounted){setItems(data||[]);setLoading(false);await supabase.from('notifications').update({read_at:new Date().toISOString()}).is('read_at',null)}})();return()=>{mounted=false}},[])
  return <><Topbar profile={profile} title="النشاط والإشعارات"/><main className="screen page-with-nav">{loading?<Loader/>:<div className="activity-list">{items.length?items.map(n=><div className="activity-item" key={n.id}><div className="activity-icon"><Bell/></div><div><h3>{n.title}</h3><p>{n.body}</p><small>{ago(n.created_at)}</small></div></div>):<div className="empty-card">ما عندك إشعارات حالياً.</div>}</div>}</main></>
}

function FavoritesScreen({ profile, onBack, onOpen }) {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true)
  async function load(){
    setLoading(true)
    const {data,error}=await supabase.from('favorites').select('request_id, requests:request_id(*, request_media(public_url))').eq('user_id',profile.id).order('created_at',{ascending:false})
    if(!error)setItems((data||[]).map(x=>x.requests).filter(Boolean))
    setLoading(false)
  }
  useEffect(()=>{load()},[])
  return <div className="overlay-page"><Topbar profile={profile} title="المفضلة" onBack={onBack}/><main className="screen">{loading?<Loader/>:<div className="request-list">{items.length?items.map(x=><RequestCard key={x.id} item={x} onOpen={onOpen}/>):<div className="empty-card">ما عندك عناصر محفوظة حالياً.</div>}</div>}</main></div>
}

function MyRequestsScreen({ profile, onBack, onOpen }) {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [filter,setFilter]=useState('all')
  async function load(){setLoading(true);const {data}=await supabase.from('requests').select('*, request_media(public_url)').eq('owner_id',profile.id).order('created_at',{ascending:false});setItems(data||[]);setLoading(false)}
  useEffect(()=>{load()},[])
  const view=items.filter(x=>filter==='all'||x.status===filter)
  return <div className="overlay-page"><Topbar profile={profile} title="طلباتي" onBack={onBack}/><main className="screen"><div className="chips"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>الكل</button><button className={filter==='open'?'active':''} onClick={()=>setFilter('open')}>مفتوحة</button><button className={filter==='accepted'?'active':''} onClick={()=>setFilter('accepted')}>مقبولة</button><button className={filter==='in_progress'?'active':''} onClick={()=>setFilter('in_progress')}>قيد التنفيذ</button><button className={filter==='completed'?'active':''} onClick={()=>setFilter('completed')}>مكتملة</button></div>{loading?<Loader/>:<div className="request-list">{view.length?view.map(x=><RequestCard key={x.id} item={x} onOpen={onOpen}/>):<div className="empty-card">ماكو طلبات بهالحالة.</div>}</div>}</main></div>
}

function SettingsScreen({ profile, onBack, onToast }) {
  const [notifyBusy,setNotifyBusy]=useState(false)
  async function enableNotifications(){setNotifyBusy(true);const ok=await requestNotificationPermission();setNotifyBusy(false);onToast(ok===false?'ما تم منح إذن الإشعارات.':'تم تحديث إذن الإشعارات.')}
  return <div className="overlay-page"><Topbar profile={profile} title="الإعدادات" onBack={onBack}/><main className="screen"><div className="settings-list">
    <button onClick={enableNotifications}><BellRing/><span><b>إشعارات التطبيق</b><small>العروض والرسائل وتحديثات الطلبات</small></span><span>{notifyBusy?'...':'تفعيل'}</span></button>
    <button><Moon/><span><b>المظهر</b><small>الوضع الداكن هو الهوية الافتراضية لمطلوب</small></span><span>داكن</span></button>
    <button><Globe2/><span><b>اللغة</b><small>واجهة عربية واتجاه RTL</small></span><span>العربية</span></button>
    <button onClick={()=>window.open('mailto:support@matloob.app','_self')}><ShieldCheck/><span><b>الدعم والخصوصية</b><small>للمشاكل والبلاغات المتعلقة بالحساب</small></span><ChevronLeft/></button>
  </div></main></div>
}

function ProfileScreen({ profile, onProfileChange, onToast, onFavorites, onRequests, onSettings }) {
  const [stats,setStats]=useState(null); const [editing,setEditing]=useState(false);const[form,setForm]=useState({display_name:profile.display_name||'',provider_title:profile.provider_title||'',provider_bio:profile.provider_bio||'',provider_enabled:profile.provider_enabled||false,phone:'',contact_mode:'app',phone_visibility:'after_accept'})
  useEffect(()=>{Promise.all([supabase.from('provider_stats').select('*').eq('provider_id',profile.id).single(),supabase.from('provider_contacts').select('*').eq('provider_id',profile.id).single()]).then(([s,c])=>{setStats(s.data);if(c.data)setForm(f=>({...f,phone:c.data.phone||'',contact_mode:c.data.contact_mode,phone_visibility:c.data.phone_visibility}))})},[profile.id])
  async function save(){const {data,error}=await supabase.from('profiles').update({display_name:form.display_name.trim(),provider_enabled:form.provider_enabled,provider_title:form.provider_title.trim()||null,provider_bio:form.provider_bio.trim()||null}).eq('id',profile.id).select().single();if(error)return onToast(error.message);const c=await supabase.from('provider_contacts').update({phone:form.phone.trim()||null,contact_mode:form.contact_mode,phone_visibility:form.phone_visibility}).eq('provider_id',profile.id);if(c.error)return onToast(c.error.message);onProfileChange(data);setEditing(false);onToast('تم حفظ الإعدادات')}
  async function signOut(){await logoutNotifications();await supabase.auth.signOut()}
  const avg=stats?.rating_count? (stats.rating_sum/stats.rating_count).toFixed(1):'جديد'
  return <><Topbar profile={profile} title="الملف الشخصي"/><main className="screen page-with-nav"><section className="profile-card"><div className="profile-avatar">{profile.avatar_url?<img src={profile.avatar_url}/>:<UserRound/>}</div><h1>{profile.display_name}</h1><p>{profile.provider_enabled?(profile.provider_title||'مقدم خدمة في مطلوب'):'حساب مستخدم'}</p><div className="profile-stats"><div><b>{avg}</b><span>التقييم</span></div><div><b>{stats?.completed_jobs||0}</b><span>مهمة مكتملة</span></div><div><b>{stats?.verified?'موثق':'عادي'}</b><span>حالة الحساب</span></div></div></section>
    <div className="settings-list"><button onClick={()=>setEditing(true)}><Settings/><span><b>إعدادات الحساب</b><small>الاسم، مقدم الخدمة وطرق التواصل</small></span><ChevronLeft/></button><button onClick={onFavorites}><Heart/><span><b>المفضلة</b><small>العناصر التي حفظتها</small></span><ChevronLeft/></button><button onClick={onRequests}><BriefcaseBusiness/><span><b>طلباتي</b><small>تابع طلباتك وحالتها</small></span><ChevronLeft/></button><button onClick={onSettings}><ShieldCheck/><span><b>إعدادات التطبيق</b><small>الإشعارات والخصوصية</small></span><ChevronLeft/></button><button className="danger" onClick={signOut}><LogOut/><span><b>تسجيل الخروج</b><small>الخروج من حسابك</small></span></button></div>
    {editing&&<div className="modal-backdrop"><div className="modal glass"><div className="modal-head"><h2>إعدادات الحساب</h2><button className="icon-btn" onClick={()=>setEditing(false)}><X/></button></div><div className="stack-form"><label>الاسم<input value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})}/></label><label className="switch-row"><span><b>تفعيل وضع مقدم الخدمة</b><small>يسمح لك بتقديم عروض على طلبات الآخرين</small></span><input type="checkbox" checked={form.provider_enabled} onChange={e=>setForm({...form,provider_enabled:e.target.checked})}/></label>{form.provider_enabled&&<><label>عنوان الخدمة<input value={form.provider_title} onChange={e=>setForm({...form,provider_title:e.target.value})} placeholder="مثال: فني كهرباء وتبريد"/></label><label>نبذة<textarea rows={3} value={form.provider_bio} onChange={e=>setForm({...form,provider_bio:e.target.value})}/></label><label>رقم التواصل<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="07xxxxxxxxx"/></label><label>طريقة التواصل<select value={form.contact_mode} onChange={e=>setForm({...form,contact_mode:e.target.value})}><option value="app">داخل التطبيق فقط</option><option value="phone">الهاتف</option><option value="both">داخل التطبيق والهاتف</option></select></label><label>إظهار الرقم<select value={form.phone_visibility} onChange={e=>setForm({...form,phone_visibility:e.target.value})}><option value="never">لا يظهر أبداً</option><option value="after_accept">بعد قبول العرض فقط</option><option value="always">يظهر دائماً</option></select></label></>}<button className="primary-btn" onClick={save}>حفظ</button></div></div></div>}
  </main></>
}

function MainApp({ profile, setProfile, onToast }) {
  const [tab,setTab]=useState('home'); const [selected,setSelected]=useState(null); const [createType,setCreateType]=useState(null); const [chat,setChat]=useState(null); const [panel,setPanel]=useState(null)
  if(chat)return <ChatScreen conversation={chat} profile={profile} onBack={()=>setChat(null)} onToast={onToast}/>
  if(selected)return <RequestDetail request={selected} profile={profile} onBack={()=>setSelected(null)} onChat={setChat} onToast={onToast}/>
  if(createType)return <CreateRequest profile={profile} initialType={createType} onClose={()=>setCreateType(null)} onCreated={r=>{setCreateType(null);setSelected(r);onToast('تم نشر طلبك بنجاح')}} onToast={onToast}/>
  if(panel==='favorites')return <FavoritesScreen profile={profile} onBack={()=>setPanel(null)} onOpen={r=>{setPanel(null);setSelected(r)}}/>
  if(panel==='requests')return <MyRequestsScreen profile={profile} onBack={()=>setPanel(null)} onOpen={r=>{setPanel(null);setSelected(r)}}/>
  if(panel==='settings')return <SettingsScreen profile={profile} onBack={()=>setPanel(null)} onToast={onToast}/>
  return <div className="app-shell">{tab==='home'&&<HomeScreen profile={profile} onOpen={setSelected} onCreateType={setCreateType}/>} {tab==='explore'&&<ExploreScreen profile={profile} onOpen={setSelected}/>} {tab==='activity'&&<ActivityScreen profile={profile}/>} {tab==='profile'&&<ProfileScreen profile={profile} onProfileChange={setProfile} onToast={onToast} onFavorites={()=>setPanel('favorites')} onRequests={()=>setPanel('requests')} onSettings={()=>setPanel('settings')}/>}<BottomNav tab={tab} setTab={setTab} onCreate={()=>setCreateType('service')}/></div>
}

export default function App(){
  const [splash,setSplash]=useState(true);const[onboarded,setOnboarded]=useState(localStorage.getItem('matloob_onboarded')==='1');const[session,setSession]=useState(null);const[profile,setProfile]=useState(null);const[loading,setLoading]=useState(true);const[toast,setToast]=useState('')
  useEffect(()=>{const t=setTimeout(()=>setSplash(false),1200);supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);if(!s)setProfile(null)});return()=>{clearTimeout(t);subscription.unsubscribe()}},[])
  useEffect(()=>{if(!session?.user){setProfile(null);return}(async()=>{let {data}=await supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle();if(!data){await new Promise(r=>setTimeout(r,350));({data}=await supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle())}setProfile(data);initNotifications(session.user.id)})()},[session?.user?.id])
  useEffect(()=>{if(!session?.user?.id)return;const ch=supabase.channel(`user:${session.user.id}:notifications`).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${session.user.id}`},p=>setToast(p.new?.title||'لديك تحديث جديد')).subscribe();return()=>supabase.removeChannel(ch)},[session?.user?.id])
  if(splash)return <Splash/>
  if(!onboarded)return <Onboarding onDone={()=>{localStorage.setItem('matloob_onboarded','1');setOnboarded(true)}}/>
  if(loading)return <Loader/>
  if(!session)return <><AuthScreen onToast={setToast}/><Toast message={toast} onClose={()=>setToast('')}/></>
  if(!profile)return <Loader label="جاري تجهيز حسابك"/>
  if(!profile.province)return <><LocationSetup profile={profile} onDone={setProfile} onToast={setToast}/><Toast message={toast} onClose={()=>setToast('')}/></>
  return <><MainApp profile={profile} setProfile={setProfile} onToast={setToast}/><Toast message={toast} onClose={()=>setToast('')}/></>
}