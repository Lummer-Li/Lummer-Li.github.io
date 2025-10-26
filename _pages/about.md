---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

I am an Eng.D. student at the College of Computer and Information Technology, <a href='https://www.bjtu.edu.cn/'>Beijing Jiaotong University(BJTU)</a>. My supervised by Prof. <a href='https://faculty.bjtu.edu.cn/8516/'>Dongxia Chang</a> in the Center of Digital Media Information Processing Lab (Mepro). I have published several papers in SCI/CCF conferences and journals, including ACM MM, TMM, and Neurocomputing. (Resume: <a href='images/english.pdf'>EN</a>/<a href="images/chinese.pdf">中文</a>)

My research interests include multi-view/multi-modal representation learning, deep clustering, self-supervised learning, and contrastive learning. In particular, I focus on:
- 🔍 **Contrastive Multi-view Clustering**
- 🧠 **Incremental Multi-view/Multi-Modal Representation Learning**
- 🌐 **Self-supervised Multi-view/Multi-Modal Representation Learning**


# 🔥 News
- *2025.09*: &nbsp;🎉🎉 One paper has been accepted by Neurocomputing 2025. 
- *2025.07*: &nbsp;🎉🎉 One paper has been accepted by IEEE Transactions on Multimedia 2025. 
- *2025.07*: &nbsp;🎉🎉 One paper has been accepted by ACM MM 2025. 
- *2025.03*: &nbsp;🎉🎉 One paper has been accepted by Neurocomputing 2025. 

# 📝 Publications 
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ACM MM 2025</div><img src='images/AEMVC.png' alt="sym" width="100%" style="height: 240px;"></div></div>
<div class='paper-box-text' markdown="1">

[AEMVC: Mitigate Imbalanced Embedding Space in Multi-view Clustering](https://dl.acm.org/doi/10.1145/3746027.3754697)

**Pengyuan Li**, Man Liu, Dongxia Chang*, Yiming Wang, Zisen Kong, Yao Zhao

[**Paper**](https://dl.acm.org/doi/10.1145/3746027.3754697) | [**Code**](https://github.com/Lummer-Li/AEMVC) 
<strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- We found that the embedding space learned using the encoder-decoder architecture cannot embrace the efficacy of different feature directions. Therefore, we propose a novel Activate-Then-Eliminate Strategy for Multi-View Clustering to adjust the contribution strength of different feature directions dynamically.
</div>
</div>



<div class='paper-box'><div class='paper-box-image'><div><div class="badge">TMM 2025</div><img src='images/MISCC.png' alt="sym" width="100%" style="height: 240px;"></div></div>
<div class='paper-box-text' markdown="1">

[Deep Multi-view Clustering with Intra-view Similarity and Cross-view Correlation Learning](#)

**Pengyuan Li**, Dongxia Chang*, Yiming Wang, Man Liu, Zisen Kong, Linhua Kong, Yao Zhao

[**Paper**](#) | [**Code**](https://github.com/Lummer-Li/MISCC) 
<strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- We present a novel deep learning framework that mitigates view bias through joint optimization of intra-view similarity and cross-view correlation. The proposed method enhances fine-grained structures within each view and adaptively balances diverse information across views, ultimately improving clustering performance.
</div>
</div>


<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Neurocomputing 2025</div><img src='images/DCMVC.jpg' alt="sym" width="100%" style="height: 240px;"></div></div>
<div class='paper-box-text' markdown="1">

[DCMVC: Dual Contrastive Multi-view Clustering](https://www.sciencedirect.com/science/article/abs/pii/S0925231225005612)

**Pengyuan Li**, Dongxia Chang*, Zisen Kong, Yiming Wang, Yao Zhao

[**Paper**](https://www.sciencedirect.com/science/article/abs/pii/S0925231225005612) | [**Code**](https://github.com/Lummer-Li/DCMVC) 
<strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- We propose a novel deep contrastive multi-view clustering method termed DCMVC. The dual contrastive mechanism can alleviate the constraints of a single positive sample on contrastive learning by incorporating category information to regularize the feature structure and fully explore the consistency of similar samples.
</div>
</div>




<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Neurocomputing 2025</div><img src='images/BCMVC.jpg' alt="sym" width="100%" style="height: 240px;"></div></div>
<div class='paper-box-text' markdown="1">

[Bipartite Contrastive Multi-view Clustering with Singular Value Modulation](https://www.sciencedirect.com/science/article/abs/pii/S0925231225022003)

Teng Zhang, **Pengyuan Li**, Zisen Kong, Dongxia Chang∗, Yao Zhao

<a href='https://www.sciencedirect.com/science/article/abs/pii/S0925231225022003' style='color: #224b8d; font-size: 1em; font-weight: bolder; text-decoration: underline;'>Paper</a> | <a href='https://github.com/zhangt-make/BCMVC' style='color: #224b8d; font-size: 1em; font-weight: bolder; text-decoration: underline;'>Code</a> 
<strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- We reformulate contrastive learning as a binary classification problem, avoiding the limitation in previous contrastive methods that heavily depend on naturally paired data. By capturing sample-level and category-level consistency relationships among multiple views, the learned representations are further refined.
</div>
</div>








# 🎖 Honors and Awards
- *2023.11* First-class Academic Scholarship of Beijing Jiaotong University. 
- *2023.06* Outstanding Graduate Student of the School of Computer Science, Beijing Jiaotong University.
- *2022.10* National Bronze Award of the 2022 China University Computer Competition - Team Programming Ladder Competition.
- *2022.10* National Bronze Award of China Computer Design Contest 2022.


# 📖 Educations
- *2024.06 - now*, Eng.D. Student @ Beijing Jiaotong University, supervised by Prof. Dongxia Chang.
- *2023.09 - 2024.06*, Master Student @ Beijing Jiaotong University, supervised by Prof. Dongxia Chang.

# 💻 Internships
- *2023.03 - 2023.06*, [PCITC](http://www.pcitc.com/), China.

