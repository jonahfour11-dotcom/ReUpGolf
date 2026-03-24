import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const products = [
  { id: 1, brand: "Titleist", name: "Pro V1", price: 2.29, tag: "Premium" },
  { id: 2, brand: "Titleist", name: "Pro V1x", price: 2.29, tag: "Premium" },
  { id: 3, brand: "TaylorMade", name: "TP5", price: 2.09, tag: "Best Value" },
  { id: 4, brand: "TaylorMade", name: "TP5x", price: 2.09, tag: "Best Value" },
  { id: 5, brand: "Callaway", name: "Chrome Soft", price: 1.99 },
  { id: 6, brand: "Callaway", name: "Chrome Soft X", price: 1.99 },
  { id: 7, brand: "Srixon", name: "Z-Star", price: 1.89 },
  { id: 8, brand: "Srixon", name: "Z-Star XV", price: 1.89 },
  { id: 9, brand: "Bridgestone", name: "Tour B RX", price: 1.79 },
  { id: 10, brand: "Bridgestone", name: "Tour B X", price: 1.79 },
  { id: 11, brand: "Vice", name: "Pro", price: 1.59 },
  { id: 12, brand: "Vice", name: "Pro Plus", price: 1.59 },
  { id: 13, brand: "Maxfli", name: "Tour", price: 1.19 },
  { id: 14, brand: "Maxfli", name: "Tour X", price: 1.19 },
  { id: 15, brand: "Top Flite", name: "XL", price: 0.89 },
  { id: 16, brand: "Pinnacle", name: "Rush", price: 0.99 },
  { id: 17, brand: "Random", name: "Random Mix", price: 0.79, tag: "Best Value" }
];

const conditionAdjust = { Mint: 0.3, Standard: 0, Practice: -0.3 };
const NEW_BALL_PRICE = 3.5;

const conditionDescriptions = {
  Mint: "Like new. Very minimal wear.",
  Standard: "Light wear. Great performance.",
  Practice: "Visible wear. Best for practice."
};

const getTagStyle = (tag) => {
  if (tag === "Premium") return "bg-yellow-400 text-black";
  if (tag === "Best Value") return "bg-gray-300 text-black";
  return "bg-green-600 text-white";
};

export default function GolfBallStore() {
  const [step, setStep] = useState("amount");
  const [selectedPack, setSelectedPack] = useState(null);
  const [selections, setSelections] = useState({});
  const [conditions, setConditions] = useState({});
  const [singleProduct, setSingleProduct] = useState(null);
  const [singleQty, setSingleQty] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("golf_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelections(parsed.selections || {});
      setConditions(parsed.conditions || {});
      setSingleProduct(parsed.singleProduct || null);
      setSingleQty(parsed.singleQty || 0);
      setSelectedPack(parsed.selectedPack || null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("golf_state", JSON.stringify({ selections, conditions, singleProduct, singleQty, selectedPack }));
  }, [selections, conditions, singleProduct, singleQty, selectedPack]);

  const totalSelected = Object.values(selections).reduce((a,b)=>a+b,0) + singleQty;
  const getLimit = () => typeof selectedPack === "number" ? selectedPack : Infinity;

  const getPrice = (p,id) => p.price + (conditionAdjust[conditions[id]||"Standard"]);

  const getTotal = () => {
    let t=0;
    Object.entries(selections).forEach(([id,q])=>{
      const p = products.find(x=>x.id==id);
      t+= getPrice(p,id)*q;
    });
    if(singleProduct){
      const cond = conditions["single"]||"Standard";
      t += (singleProduct.price + conditionAdjust[cond]) * singleQty;
    }
    return t;
  };

  const getSavings = () => (totalSelected * NEW_BALL_PRICE - getTotal()).toFixed(2);

  const page = {initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0}};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-black text-white p-6">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ReUpGolf</h1>
        <div className="cursor-pointer bg-white/10 px-4 py-2 rounded-xl" onClick={()=>setStep("cart")}>
          🛒 {totalSelected} | ${getTotal().toFixed(2)}
        </div>
      </div>

      {/* LIMIT BAR */}
      {getLimit() !== Infinity && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="h-2 bg-green-900 rounded-full overflow-hidden">
            <motion.div className="h-2 bg-green-400" animate={{width: `${(totalSelected / getLimit()) * 100}%`}} />
          </div>
          <p className="text-xs mt-1 text-green-300">{getLimit()-totalSelected} balls remaining</p>
        </div>
      )}

      <AnimatePresence mode="wait">

        {step === "amount" && (
          <motion.div key="amount" {...page}>
            <div className="grid md:grid-cols-3 gap-6">
              {[12,24,48].map(n => (
                <Card key={n} onClick={()=>setSelectedPack(n)} className={`p-6 text-center rounded-2xl shadow-lg cursor-pointer ${selectedPack===n?"bg-green-600 text-white":"bg-white text-black"}`}>
                  <h2 className="text-3xl font-bold">{n}</h2>
                  <p>balls</p>
                  <p className="text-xs mt-2">Est. ${(n*1.6).toFixed(2)} - ${(n*2.4).toFixed(2)}</p>
                </Card>
              ))}

              <Card onClick={()=>setSelectedPack("custom")} className={`p-6 text-center rounded-2xl cursor-pointer ${selectedPack==="custom"?"bg-green-600 text-white":"bg-white text-black"}`}>
                <h2 className="font-bold">Custom</h2>
                <p className="text-xs">Build your own mix</p>
              </Card>

              <Card onClick={()=>setSelectedPack("single")} className={`p-6 text-center rounded-2xl cursor-pointer ${selectedPack==="single"?"bg-green-600 text-white":"bg-white text-black"}`}>
                <h2 className="font-bold">Single Type</h2>
                <p className="text-xs">One ball only</p>
              </Card>
            </div>

            {selectedPack && <>
              <Button className="mt-6 w-full" onClick={()=>setStep(selectedPack==="single"?"single":"select")}>Next</Button>

              <p className="mt-4 text-sm text-green-200 max-w-2xl mx-auto text-center">
                ReUpGolf is a modern golf brand focused on giving premium golf balls a second life. We source high-quality, gently used balls from top brands and refurbish them to deliver great performance at a fraction of the price. Whether you're a casual weekend player or grinding to improve your game, ReUpGolf helps you play smarter, save money, and reduce waste—without sacrificing quality.
              </p>
            </>}
          </motion.div>
        )}

        {step === "select" && (
          <motion.div key="select" {...page}>
            <button onClick={()=>setStep("amount")}>← Back</button>
            <p className="text-green-400">You save ${getSavings()}</p>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {products.map(p => (
                <Card key={p.id} className={`p-4 rounded-xl ${selections[p.id]?"bg-green-600 text-white":"bg-white text-black"}`}>
                  <CardContent className="text-center">
                    <p className="text-xs">{p.brand}</p>
                    <p className="font-bold">{p.name}</p>
                    {p.tag && <span className={`text-xs px-2 py-1 rounded ${getTagStyle(p.tag)}`}>{p.tag}</span>}
                    <p className="mt-1">${getPrice(p,p.id).toFixed(2)}</p>

                    {/* CONDITION SELECTOR ADDED BACK */}
                    <select
                      className="mt-2 text-black rounded px-2 py-1"
                      value={conditions[p.id]||"Standard"}
                      onChange={e=>setConditions({...conditions,[p.id]:e.target.value})}
                    >
                      <option>Mint</option>
                      <option>Standard</option>
                      <option>Practice</option>
                    </select>

                    <p className="text-xs mt-1 opacity-80">
                      {conditionDescriptions[conditions[p.id]||"Standard"]}
                    </p>

                    <div className="flex justify-center gap-2 mt-2">
                      <button onClick={()=>removeOne(p.id)}>-</button>
                      {selections[p.id]||0}
                      <button onClick={()=>addOne(p.id)}>+</button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button className="mt-4" onClick={()=>setStep("checkout")}>Checkout</Button>
          </motion.div>
        )}

        {step === "single" && (
          <motion.div key="single" {...page}>
            <button onClick={()=>setStep("amount")}>← Back</button>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {products.map(p => (
                <Card key={p.id} onClick={()=>setSingleProduct(p)} className={`p-4 cursor-pointer rounded-xl ${singleProduct?.id===p.id?"bg-green-600 text-white":"bg-white text-black"}`}>
                  <p className="text-xs">{p.brand}</p>
                  <p className="font-bold">{p.name}</p>
                </Card>
              ))}
            </div>

            {singleProduct && (
              <div className="mt-4">
                <select onChange={e=>setConditions({...conditions,single:e.target.value})}>
                  <option>Mint</option>
                  <option>Standard</option>
                  <option>Practice</option>
                </select>

                <p className="text-xs mt-1 opacity-80">
                  {conditionDescriptions[conditions["single"]||"Standard"]}
                </p>

                <div className="mt-2">
                  <button onClick={()=>setSingleQty(Math.max(0,singleQty-1))}>-</button>
                  {singleQty}
                  <button onClick={()=>setSingleQty(singleQty+1)}>+</button>
                </div>
                <p>Total: ${getTotal().toFixed(2)}</p>
                <Button onClick={()=>setStep("checkout")}>Checkout</Button>
              </div>
            )}
          </motion.div>
        )}

        {step === "cart" && (
          <motion.div key="cart" {...page}>
            <button onClick={()=>setStep("amount")}>← Back</button>
            <p className="text-lg mb-2">Cart</p>
            {Object.entries(selections).map(([id,q])=>{
              const p = products.find(x=>x.id==id);
              return <div key={id}>{p.name} x{q}</div>;
            })}
            {singleProduct && <div>{singleProduct.name} x{singleQty}</div>}
            <Button onClick={()=>setStep("checkout")}>Checkout</Button>
          </motion.div>
        )}

        {step === "checkout" && (
          <motion.div key="checkout" {...page}>
            <button onClick={()=>setStep("amount")}>← Back</button>
            <p className="text-xl">Total: ${getTotal().toFixed(2)}</p>
            <p className="text-green-400">You saved ${getSavings()}</p>
            <Button onClick={()=>setStep("confirmation")}>Place Order</Button>
          </motion.div>
        )}

        {step === "confirmation" && (
          <motion.div key="confirmation" {...page}>
            <h2 className="text-2xl">Order Confirmed</h2>
            <Button onClick={()=>setStep("amount")}>Home</Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
