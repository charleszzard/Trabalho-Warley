import React from 'react';
import { BookOpen, FunctionSquare, Network } from 'lucide-react';

const AcademicExplanation: React.FC = () => {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-neonPurple" />
        <h3 className="text-lg font-semibold">Fundamentação Matemática</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
        <div>
          <h4 className="flex items-center gap-2 text-white mb-2 font-medium">
            <FunctionSquare className="w-4 h-4 text-neonBlue" />
            Regressão de Processo Gaussiano (GPR)
          </h4>
          <p className="mb-2">
            Um Processo Gaussiano é uma coleção de variáveis aleatórias onde qualquer número finito delas possui distribuição conjunta Gaussiana. Neste sistema, usamos a GPR para prever a curva contínua de figurinhas únicas coletadas ao longo do tempo.
          </p>
          <p>
            Diferente de modelos determinísticos, o GP fornece uma <strong>previsão probabilística</strong>, significando que ele retorna tanto uma função de média (a curva esperada) quanto uma função de covariância (a incerteza ou intervalo de confiança).
          </p>
        </div>
        
        <div>
          <h4 className="flex items-center gap-2 text-white mb-2 font-medium">
            <Network className="w-4 h-4 text-neonBlue" />
            Kernel RBF & Colecionador de Cupons
          </h4>
          <p className="mb-2">
            O kernel de <strong>Função de Base Radial (RBF)</strong> é usado para definir a covariância, assumindo que pacotes abertos em tempos próximos trarão progresso semelhante, resultando em uma curva suave e não linear.
          </p>
          <div className="bg-black/50 p-3 rounded border border-white/10 font-mono text-xs mb-2">
            k(x, x') = σ² * exp(-||x - x'||² / 2l²)
          </div>
          <p>
            O preenchimento do álbum segue o <em>Problema do Colecionador de Cupons</em>, onde a probabilidade de encontrar uma nova figurinha diminui exponencialmente à medida que o álbum enche, exigindo assintoticamente mais pacotes para encontrar as últimas figurinhas faltantes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcademicExplanation;
