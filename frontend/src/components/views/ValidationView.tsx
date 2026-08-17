import React, { useState, useEffect } from 'react';
import { Globe2, ShieldCheck, Database, Layers, ArrowRight, ExternalLink } from 'lucide-react';
import { DatasetItem } from '../../types';
import { fetchDatasets } from '../../lib/api';

export const ValidationView: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    fetchDatasets()
      .then(setDatasets)
      .catch(console.error);
  }, []);

  const domainBenchmarks = [
    {
      modality: 'Chest Radiograph (CXR)',
      primaryDataset: 'CheXpert / CheXlocalize',
      model: 'DenseNet-121',
      accuracy: 88.4,
      auc: 0.912,
      meanXQI: 87.6,
      meanReliability: 92.1,
      robustness: 93.8,
      status: 'Core Primary Benchmark'
    },
    {
      modality: 'Dermoscopy',
      primaryDataset: 'ISIC 2024 / HAM10000',
      model: 'EfficientNet-B4',
      accuracy: 90.1,
      auc: 0.934,
      meanXQI: 85.2,
      meanReliability: 89.4,
      robustness: 91.5,
      status: 'Cross-Domain Validation'
    },
    {
      modality: 'Brain MRI (Multi-Modal)',
      primaryDataset: 'BraTS 2023',
      model: 'Swin Transformer',
      accuracy: 89.3,
      auc: 0.925,
      meanXQI: 83.9,
      meanReliability: 87.8,
      robustness: 89.2,
      status: 'Cross-Modality Validation'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-clinical-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Generalization & Cross-Domain
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-clinical-900 tracking-tight mt-1.5">
          Cross-Domain Validation Lab
        </h1>
        <p className="text-sm text-clinical-600 font-medium mt-1 max-w-3xl">
          Addressing the <strong>Cross-Domain Validation Gap (RG5)</strong>. Explanation reliability principles are tested
          across three diverse medical imaging modalities: Chest Radiographs (CheXpert), Dermoscopic Lesions (ISIC), and Volumetric Brain MRI (BraTS).
        </p>
      </div>

      {/* Cross-Domain Comparative Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {domainBenchmarks.map((b) => (
          <div
            key={b.modality}
            className="bg-white rounded-xl border border-clinical-200 p-4.5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-clinical-100 text-clinical-800 font-semibold font-mono">
                  {b.status}
                </span>
                <h3 className="text-base font-bold text-clinical-900 mt-1">{b.modality}</h3>
              </div>
            </div>

            <div className="space-y-1 text-xs text-clinical-600 border-t border-clinical-100 pt-2 font-medium">
              <div className="flex justify-between">
                <span>Benchmark Cohort:</span>
                <span className="font-bold text-clinical-800">{b.primaryDataset}</span>
              </div>
              <div className="flex justify-between">
                <span>Architecture:</span>
                <span className="font-mono text-clinical-800">{b.model}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-clinical-100 text-center font-mono">
              <div className="p-2 rounded bg-clinical-50 border border-clinical-100">
                <span className="text-[10px] text-clinical-500 block uppercase font-sans">AUC-ROC</span>
                <span className="text-sm font-bold text-blue-600">{b.auc.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-clinical-50 border border-clinical-100">
                <span className="text-[10px] text-clinical-500 block uppercase font-sans">Mean XQI</span>
                <span className="text-sm font-bold text-clinical-900">{b.meanXQI.toFixed(1)}</span>
              </div>
              <div className="p-2 rounded bg-clinical-50 border border-clinical-100">
                <span className="text-[10px] text-clinical-500 block uppercase font-sans">Reliability</span>
                <span className="text-sm font-bold text-emerald-600">{b.meanReliability.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dataset Registry Table */}
      <div className="bg-white rounded-xl border border-clinical-200 shadow-sm overflow-hidden space-y-0">
        <div className="px-5 py-4 border-b border-clinical-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-clinical-900 uppercase tracking-wider">
              Medical Research Dataset Registry
            </h2>
            <p className="text-xs text-clinical-500 font-medium">
              Registered benchmark datasets, access credentialing status, and ground-truth annotation tiers
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-clinical-700">
            <thead className="bg-clinical-50/80 text-clinical-600 border-b border-clinical-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Dataset Name</th>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Role in TrustXAI</th>
                <th className="py-3 px-4">Ground-Truth Annotations</th>
                <th className="py-3 px-4">Access Requirement</th>
                <th className="py-3 px-4">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-100 font-medium">
              {datasets.map((d) => (
                <tr key={d.id} className="hover:bg-clinical-50/80">
                  <td className="py-3 px-4 font-bold text-clinical-900">
                    <div>{d.name}</div>
                    <div className="text-[10px] text-clinical-500 font-normal">{d.citation}</div>
                  </td>
                  <td className="py-3 px-4 text-clinical-700">{d.modality}</td>
                  <td className="py-3 px-4 font-semibold text-clinical-800">{d.role_in_research}</td>
                  <td className="py-3 px-4 text-clinical-600">{d.annotations_type}</td>
                  <td className="py-3 px-4 text-clinical-600">{d.access_level}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
